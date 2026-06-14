import os
import firebase_admin
from firebase_admin import credentials, messaging
from loguru import logger
import json

# Initialize Firebase Admin
_firebase_app = None

def init_firebase():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    try:
        # Load credentials from file
        cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "firebase_credentials.json")
        if not os.path.exists(cred_path):
            logger.warning("Firebase credentials file not found. Push notifications will be disabled.")
            return None

        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized successfully.")
        return _firebase_app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin: {str(e)}")
        return None

# Call init right away (but it handles missing gracefully)
init_firebase()

def send_fcm_notification(token: str, title: str, body: str, data: dict = None, channel_id: str = 'wkn_approval_channel'):
    """
    Send a push notification to a specific device token.
    """
    if not _firebase_app:
        logger.warning("Cannot send notification: Firebase not initialized.")
        return False

    if not token:
        logger.warning("Cannot send notification: FCM Token is missing.")
        return False

    if data is None:
        data = {}

    # Ensure all data values are strings (Firebase requirement)
    data_str = {str(k): str(v) for k, v in data.items()}

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data_str,
            token=token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    sound='default',
                    channel_id=channel_id
                )
            )
        )

        response = messaging.send(message)
        logger.info(f"Successfully sent message to {token}: {response}")
        return True
    except Exception as e:
        logger.error(f"Error sending FCM message: {str(e)}")
        return False
