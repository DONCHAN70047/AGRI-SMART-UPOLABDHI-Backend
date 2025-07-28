import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

# Configuration       
cloudinary.config( 
    cloud_name = "dsktyutef", 
    api_key = "264461953814364", 
    api_secret = "H6nmg4inVdwYmbE9cVKMPrT-8gM", # Click 'View API Keys' above to copy your API secret
    secure=True
)

def create_link(image_file, image_name):
    # Upload an image
    upload_result = cloudinary.uploader.upload(image_file,
                                            public_id=f"uploads/{image_name}")
    print(upload_result["secure_url"])

    # # Optimize delivery by resizing and applying auto-format and auto-quality
    # optimize_url, _ = cloudinary_url("shoes", fetch_format="auto", quality="auto")
    # print(optimize_url)

    # # Transform the image: auto-crop to square aspect_ratio
    # auto_crop_url, _ = cloudinary_url("shoes", width=500, height=500, crop="auto", gravity="auto")
    # print(auto_crop_url)

    return upload_result["secure_url"]