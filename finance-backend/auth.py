import os
from typing import Optional
from fastapi import HTTPException, Security, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient

# FastAPI security dependency to parse the Bearer header
# Setting auto_error=False allows us to gracefully log and specify header issues
security = HTTPBearer(auto_error=False)

# Resolve Clerk JWKS URL from environment or fallback to your decoded public instance URL:
# pk_test_bWFpbi1yaW5ndGFpbC0zLmNsZXJrLmFjY291bnRzLmRldiQ -> main-ringtail-3.clerk.accounts.dev
CLERK_JWKS_URL = os.getenv(
    "CLERK_JWKS_URL", 
    "https://main-ringtail-3.clerk.accounts.dev/.well-known/jwks.json"
)
jwk_client = PyJWKClient(CLERK_JWKS_URL)

class ClerkAuth:
    """
    FastAPI security dependency to verify Clerk JWTs.
    Decodes the Bearer token against Clerk's JWKS and extracts the User ID ('sub' claim).
    """
    def __call__(
        self, 
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
    ) -> str:
        # Debug Log: Track what header reaches the backend
        auth_header = request.headers.get("Authorization")
        print(f"DEBUG: [ClerkAuth] Incoming Authorization Header: {auth_header}")
        
        if not credentials:
            if not auth_header:
                print("DEBUG: [ClerkAuth] Rejecting: Authorization header is completely missing")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated: Authorization header is missing",
                )
            else:
                print(f"DEBUG: [ClerkAuth] Rejecting: Authorization header is malformed. Value: '{auth_header}'")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated: Authorization header is malformed. Expected 'Bearer <token>'",
                )
                
        token = credentials.credentials
        print(f"DEBUG: [ClerkAuth] Extracted Token: {token[:15]}...{token[-15:] if len(token) > 30 else ''}")
        
        try:
            # Retrieve the appropriate signing key matching kid (Key ID) header in JWT
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            
            # Decode and verify token signature
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}  # Bypassing audience check for standard session tokens
            )
            
            # Clerk user ID is stored in the 'sub' (subject) claim
            user_id = payload.get("sub")
            if not user_id:
                print("DEBUG: [ClerkAuth] Rejecting: 'sub' claim is missing from payload")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: 'sub' (subject) claim is missing",
                )
                
            print(f"DEBUG: [ClerkAuth] Verification Successful! User ID: {user_id}")
            return user_id
            
        except jwt.ExpiredSignatureError:
            print("DEBUG: [ClerkAuth] Rejecting: Token signature has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
            )
        except jwt.InvalidTokenError as err:
            print(f"DEBUG: [ClerkAuth] Rejecting: Invalid token error - {str(err)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(err)}",
            )
        except Exception as err:
            print(f"DEBUG: [ClerkAuth] Rejecting: General verification error - {str(err)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authorization header validation failed: {str(err)}",
            )
