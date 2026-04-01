import os
import cloudinary
import cloudinary.uploader

# ── Configure Cloudinary from .env ────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True  # always use https URLs
)

async def upload_image(file_bytes: bytes, product_id: int) -> str:
    """
    Uploads an image to Cloudinary and returns the secure URL.

    Images are organized in folders by product:
      acheaqui/products/{product_id}/filename

    Cloudinary automatically:
      - Generates a unique filename
      - Optimizes the image
      - Serves it via CDN

    Returns the full https URL to store in product_images table.
    """
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"acheaqui/products/{product_id}",
        resource_type="image",
        allowed_formats=["jpg", "jpeg", "png", "webp"],
        transformation=[
            {"width": 1200, "height": 1200, "crop": "limit"},  # max size cap
            {"quality": "auto"},                                 # auto compress
            {"fetch_format": "auto"},                            # serve webp to browsers that support it
        ]
    )
    return result["secure_url"]


async def delete_image(image_url: str) -> bool:
    """
    Deletes an image from Cloudinary by its URL.
    Extracts the public_id from the URL automatically.
    Called when a product image is deleted from the DB.
    """
    try:
        # Extract public_id from URL
        # URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
        parts = image_url.split("/upload/")
        if len(parts) < 2:
            return False
        public_id_with_ext = parts[1]
        # Remove version prefix if present (v1234567890/)
        if public_id_with_ext.startswith("v"):
            public_id_with_ext = "/".join(public_id_with_ext.split("/")[1:])
        # Remove file extension
        public_id = ".".join(public_id_with_ext.split(".")[:-1])
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception:
        return False