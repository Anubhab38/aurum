import os
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient

# FastAPI security dependency to parse the Bearer header
security = HTTPBearer()

# Resolve Clerk JWKS URL from environment or fallback to standard Clerk JWKS
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://api.clerk.com/v1/jwks")
jwk_client = PyJWKClient(CLERK_JWKS_URL)

class ClerkAuth:
    """
    FastAPI security dependency to verify Clerk JWTs.
    Decodes the Bearer token against Clerk's JWKS and extracts the User ID ('sub' claim).
    """
    def __call__(self, credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
        token = credentials.credentials
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
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: 'sub' (subject) claim is missing",
                )
            return user_id
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
            )
        except jwt.InvalidTokenError as err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(err)}",
            )
        except Exception as err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authorization header validation failed: {str(err)}",
            )
