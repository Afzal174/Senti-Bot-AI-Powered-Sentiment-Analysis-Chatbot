"""
SENTIBOT - Simple Flask API Backend
Provides basic REST API for React frontend chatbot
"""
from flask import Flask
import os

app = Flask(__name__)

@app.route("/")
def home():
    return "SentiBot Running!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
import os
import sqlite3
import random
import hashlib
import json
from datetime import datetime, timedelta
from email.message import EmailMessage
import smtplib
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.exceptions import SpotifyException, SpotifyBaseException

# Initialize Twilio client (optional) - will be initialized after load_dotenv()
twilio_client = None

# Load environment variables
load_dotenv()

# Initialize Twilio client after loading environment variables
twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
messaging_service_sid = os.getenv("MESSAGING_SERVICE_SID")
if twilio_phone:
    try:
        from twilio.rest import Client
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        if twilio_sid and twilio_token:
            twilio_client = Client(twilio_sid, twilio_token)
            print("Twilio client initialized successfully")
        else:
            print("Twilio credentials incomplete: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required")
    except ImportError:
        print("Twilio library not installed. SMS/voice alerts disabled.")

# Initialize Firebase Admin SDK (optional)
try:
    import firebase_admin
    from firebase_admin import credentials
    
    # Check if Firebase credentials file exists
    firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    if os.path.exists(firebase_cred_path):
        cred = credentials.Certificate(firebase_cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully")
    else:
        print(f"Firebase credentials file not found at '{firebase_cred_path}'. FCM notifications disabled.")
except ImportError:
    print("Firebase Admin SDK not installed. FCM notifications disabled.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}. FCM notifications disabled.")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization", "Accept"], "supports_credentials": True}})  # Enable CORS for React frontend

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")

try:
    client = Groq(api_key=api_key)
    MODEL = "llama-3.3-70b-versatile"
except KeyboardInterrupt:
    print("Warning: Groq client initialization interrupted. Retrying...")
    import time
    time.sleep(2)
    client = Groq(api_key=api_key)
    MODEL = "llama-3.3-70b-versatile"
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    raise

# Initialize Spotify client
spotify_client_id = os.getenv("SPOTIPY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
if spotify_client_id and spotify_client_secret:
    auth_manager = SpotifyClientCredentials(client_id=spotify_client_id, client_secret=spotify_client_secret)
    sp = spotipy.Spotify(auth_manager=auth_manager)
else:
    sp = None

# Store conversation history per session (simple in-memory storage)
conversation_sessions = {}

SYSTEM_PROMPT = """You are SentiBot, a friendly and empathetic conversational chatbot designed to provide emotional support and companionship. Your role is to:

1. Be conversational and natural in your responses
2. Respond naturally to greetings, questions, and casual conversation
3. Provide emotional support and companionship when users share feelings
4. Be helpful, empathetic, and engaging
5. Keep conversations light and supportive
6. Recognize and respond appropriately to crisis situations

Guidelines for responses:
- For greetings like "hello", "hi", "hey": Respond warmly and introduce yourself naturally
- For questions: Answer helpfully and conversationally
- For emotional sharing: Acknowledge feelings and provide supportive responses
- For casual conversation: Keep it light, engaging, and natural
- For crisis situations (suicide, self-harm, severe distress): Be extremely supportive, encourage professional help, provide crisis resources, and show genuine concern
- Always maintain a friendly, supportive tone
- If crisis keywords are detected, prioritize user safety and suggest immediate professional help

Crisis Response Guidelines:
- Acknowledge the person's feelings and pain
- Encourage seeking immediate professional help
- Provide crisis hotline numbers (988 Suicide & Crisis Lifeline in US, or local equivalents)
- Suggest talking to trusted friends/family
- Remind them they are not alone and their life matters
- Avoid giving medical advice, direct them to professionals

Be a good conversational companion who listens and responds naturally, especially during difficult times."""

# Constants for wellness features
POSITIVE_AFFIRMATIONS = [
    "I am worthy of love and respect.",
    "I am capable of achieving my goals.",
    "I choose to be kind to myself today.",
    "I am grateful for the good things in my life.",
    "I am strong and resilient.",
    "I deserve happiness and peace.",
    "I am enough just as I am.",
    "I trust in my ability to handle challenges.",
    "I am surrounded by love and support.",
    "I choose joy and positivity today."
]

BREATHING_EXERCISE_INSTRUCTIONS = """
4-7-8 Breathing Exercise:

1. Sit or lie down comfortably with your back straight.
2. Place the tip of your tongue against the ridge behind your upper front teeth.
3. Completely exhale through your mouth, making a whoosh sound.
4. Close your mouth and inhale quietly through your nose for a count of 4.
5. Hold your breath for a count of 7.
6. Exhale completely through your mouth for a count of 8, making a whoosh sound.
7. Repeat the cycle 4 times.

This exercise helps reduce anxiety and promotes relaxation.
"""

GUIDED_MEDITATION_SCRIPT = """
5-Minute Guided Meditation:

Find a comfortable seated position. Close your eyes gently.

Take a deep breath in... and slowly exhale.

Focus on your breath. Notice the sensation of air entering and leaving your body.

If your mind wanders, gently bring your attention back to your breath.

Imagine yourself in a peaceful place - perhaps a quiet forest or by the ocean.

Feel the calm and tranquility surrounding you.

When you're ready, slowly open your eyes, carrying this peace with you throughout your day.

Remember, you can return to this peaceful place whenever you need it.
"""

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def detect_crisis_keywords(message):
    """Detect severe crisis-related keywords in user message - only for suicide/self-harm"""
    severe_crisis_keywords = [
        # Direct suicide references
        'suicide', 'kill myself', 'end it all', 'want to die', 'end my life',
        'better off dead', 'not worth living',

        # Self-harm actions
        'cut myself', 'hurt myself', 'self harm', 'self-harm',

        # Suicide methods (be careful with these)
        'hang myself', 'shoot myself', 'poison myself', 'drown myself',
        'jump off', 'overdose', 'slit my wrists',

        # Active suicidal ideation
        'i\'m going to kill myself', 'i want to commit suicide',
        'i\'m planning to', 'i\'ve decided to end it',

        # Immediate danger phrases
        'this is my last message', 'goodbye forever', 'i won\'t be here',
        'you won\'t see me again', 'this is the end'
    ]

    message_lower = message.lower()
    return any(keyword in message_lower for keyword in severe_crisis_keywords)

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()

    # Create users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        emergency_email TEXT,
        emergency_phone TEXT,
        last_login TEXT,
        streak_count INTEGER DEFAULT 0,
        theme_preference TEXT DEFAULT 'Blue (Default)'
    )''')

    # Create chat_sessions table
    c.execute('''CREATE TABLE IF NOT EXISTS chat_sessions (
        session_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        session_name TEXT DEFAULT 'Chat Session',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users (username)
    )''')

    # Create messages table
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id)
    )''')

    # Create journal_entries table
    c.execute('''CREATE TABLE IF NOT EXISTS journal_entries (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        content TEXT NOT NULL
    )''')

    # Create goals table
    c.execute('''CREATE TABLE IF NOT EXISTS goals (
        goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'In Progress',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )''')

    conn.commit()
    conn.close()

# Initialize database on startup
init_database()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "SentiBot API is running"})


@app.route('/api/music/recommend', methods=['GET'])
def get_music_recommendations():
    """Get music recommendations based on mood"""
    try:
        mood = request.args.get('mood', 'neutral').lower()

        # Map moods to Spotify search queries for better results
        mood_queries = {
            'happy': 'happy upbeat pop dance',
            'sad': 'sad emotional indie alternative',
            'anxious': 'calm ambient lo-fi chill',
            'angry': 'rock metal punk intense',
            'neutral': 'pop indie electronic',
            'excited': 'electronic dance upbeat energetic',
            'calm': 'ambient classical jazz peaceful'
        }

        query = mood_queries.get(mood, 'pop indie')

        # Try Spotify API first
        if sp:
            try:
                # Search for tracks with mood-based query
                results = sp.search(q=query, type='track', limit=8)

                tracks = []
                for track in results['tracks']['items']:
                    tracks.append({
                        'id': track['id'],
                        'name': track['name'],
                        'artist': track['artists'][0]['name'],
                        'url': track['external_urls']['spotify'],
                        'preview_url': track.get('preview_url'),
                        'album_image': track['album']['images'][0]['url'] if track['album']['images'] else None,
                        'duration_ms': track['duration_ms'],
                        'popularity': track['popularity']
                    })

                return jsonify({
                    "success": True,
                    "mood": mood,
                    "recommendations": tracks
                })
            except (SpotifyException, SpotifyBaseException, Exception) as spotify_error:
                print(f"Spotify API error: {spotify_error}. Using fallback data.")
                # Fall through to mock data
        
        # Fallback: Use mock data when Spotify is unavailable
        mock_recommendations = {
            'happy': [
                {'id': 'mock1', 'name': 'Happy', 'artist': 'Pharrell Williams', 'url': 'https://open.spotify.com/track/happy', 'album_image': None, 'duration_ms': 232000, 'popularity': 85},
                {'id': 'mock2', 'name': 'Walking on Sunshine', 'artist': 'Katrina and the Waves', 'url': 'https://open.spotify.com/track/walking-on-sunshine', 'album_image': None, 'duration_ms': 238000, 'popularity': 75},
                {'id': 'mock3', 'name': 'Good Vibrations', 'artist': 'The Beach Boys', 'url': 'https://open.spotify.com/track/good-vibrations', 'album_image': None, 'duration_ms': 216000, 'popularity': 70},
                {'id': 'mock4', 'name': 'Don\'t Stop Me Now', 'artist': 'Queen', 'url': 'https://open.spotify.com/track/dont-stop-me-now', 'album_image': None, 'duration_ms': 209000, 'popularity': 80},
            ],
            'sad': [
                {'id': 'mock5', 'name': 'Someone Like You', 'artist': 'Adele', 'url': 'https://open.spotify.com/track/someone-like-you', 'album_image': None, 'duration_ms': 285000, 'popularity': 90},
                {'id': 'mock6', 'name': 'Fix You', 'artist': 'Coldplay', 'url': 'https://open.spotify.com/track/fix-you', 'album_image': None, 'duration_ms': 295000, 'popularity': 85},
                {'id': 'mock7', 'name': 'Hurt', 'artist': 'Johnny Cash', 'url': 'https://open.spotify.com/track/hurt', 'album_image': None, 'duration_ms': 217000, 'popularity': 75},
                {'id': 'mock8', 'name': 'Mad World', 'artist': 'Gary Jules', 'url': 'https://open.spotify.com/track/mad-world', 'album_image': None, 'duration_ms': 189000, 'popularity': 70},
            ],
            'anxious': [
                {'id': 'mock9', 'name': 'Weightless', 'artist': 'Marconi Union', 'url': 'https://open.spotify.com/track/weightless', 'album_image': None, 'duration_ms': 480000, 'popularity': 65},
                {'id': 'mock10', 'name': 'Clair de Lune', 'artist': 'Claude Debussy', 'url': 'https://open.spotify.com/track/clair-de-lune', 'album_image': None, 'duration_ms': 302000, 'popularity': 60},
                {'id': 'mock11', 'name': 'Breathe', 'artist': 'Telepopmusik', 'url': 'https://open.spotify.com/track/breathe', 'album_image': None, 'duration_ms': 245000, 'popularity': 55},
                {'id': 'mock12', 'name': 'Sunset Lover', 'artist': 'Petit Biscuit', 'url': 'https://open.spotify.com/track/sunset-lover', 'album_image': None, 'duration_ms': 234000, 'popularity': 60},
            ],
            'angry': [
                {'id': 'mock13', 'name': 'Break Stuff', 'artist': 'Limp Bizkit', 'url': 'https://open.spotify.com/track/break-stuff', 'album_image': None, 'duration_ms': 166000, 'popularity': 70},
                {'id': 'mock14', 'name': 'Killing in the Name', 'artist': 'Rage Against the Machine', 'url': 'https://open.spotify.com/track/killing-in-the-name', 'album_image': None, 'duration_ms': 312000, 'popularity': 75},
                {'id': 'mock15', 'name': 'Bodies', 'artist': 'Drowning Pool', 'url': 'https://open.spotify.com/track/bodies', 'album_image': None, 'duration_ms': 213000, 'popularity': 65},
                {'id': 'mock16', 'name': 'Down with the Sickness', 'artist': 'Disturbed', 'url': 'https://open.spotify.com/track/down-with-the-sickness', 'album_image': None, 'duration_ms': 217000, 'popularity': 70},
            ],
            'neutral': [
                {'id': 'mock17', 'name': 'Blinding Lights', 'artist': 'The Weeknd', 'url': 'https://open.spotify.com/track/blinding-lights', 'album_image': None, 'duration_ms': 200000, 'popularity': 95},
                {'id': 'mock18', 'name': 'Levitating', 'artist': 'Dua Lipa', 'url': 'https://open.spotify.com/track/levitating', 'album_image': None, 'duration_ms': 203000, 'popularity': 90},
                {'id': 'mock19', 'name': 'Watermelon Sugar', 'artist': 'Harry Styles', 'url': 'https://open.spotify.com/track/watermelon-sugar', 'album_image': None, 'duration_ms': 174000, 'popularity': 85},
                {'id': 'mock20', 'name': 'Stay', 'artist': 'The Kid LAROI & Justin Bieber', 'url': 'https://open.spotify.com/track/stay', 'album_image': None, 'duration_ms': 141000, 'popularity': 90},
            ],
            'excited': [
                {'id': 'mock21', 'name': 'Uptown Funk', 'artist': 'Mark Ronson ft. Bruno Mars', 'url': 'https://open.spotify.com/track/uptown-funk', 'album_image': None, 'duration_ms': 270000, 'popularity': 95},
                {'id': 'mock22', 'name': 'Can\'t Stop the Feeling!', 'artist': 'Justin Timberlake', 'url': 'https://open.spotify.com/track/cant-stop-the-feeling', 'album_image': None, 'duration_ms': 236000, 'popularity': 85},
                {'id': 'mock23', 'name': 'Shake It Off', 'artist': 'Taylor Swift', 'url': 'https://open.spotify.com/track/shake-it-off', 'album_image': None, 'duration_ms': 219000, 'popularity': 90},
                {'id': 'mock24', 'name': 'I Gotta Feeling', 'artist': 'The Black Eyed Peas', 'url': 'https://open.spotify.com/track/i-gotta-feeling', 'album_image': None, 'duration_ms': 289000, 'popularity': 80},
            ],
            'calm': [
                {'id': 'mock25', 'name': 'River Flows in You', 'artist': 'Yiruma', 'url': 'https://open.spotify.com/track/river-flows-in-you', 'album_image': None, 'duration_ms': 186000, 'popularity': 75},
                {'id': 'mock26', 'name': 'Gymnopédie No.1', 'artist': 'Erik Satie', 'url': 'https://open.spotify.com/track/gymnopedie-no-1', 'album_image': None, 'duration_ms': 198000, 'popularity': 65},
                {'id': 'mock27', 'name': 'Moonlight Sonata', 'artist': 'Ludwig van Beethoven', 'url': 'https://open.spotify.com/track/moonlight-sonata', 'album_image': None, 'duration_ms': 360000, 'popularity': 70},
                {'id': 'mock28', 'name': 'Canon in D', 'artist': 'Johann Pachelbel', 'url': 'https://open.spotify.com/track/canon-in-d', 'album_image': None, 'duration_ms': 330000, 'popularity': 65},
            ],
        }

        tracks = mock_recommendations.get(mood, mock_recommendations['neutral'])

        return jsonify({
            "success": True,
            "mood": mood,
            "recommendations": tracks,
            "note": "Using curated recommendations (Spotify API unavailable)"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of user message"""
    conn = None
    try:
        data = request.json
        message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        username = data.get('username') or 'anonymous'

        if not message:
            return jsonify({"error": "Message is required"}), 400

        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()

        # Get or create chat session for user
        c.execute("SELECT session_id FROM chat_sessions WHERE session_id = ? AND username = ?", (session_id, username))
        existing_session = c.fetchone()

        if not existing_session:
            # Create new session
            c.execute("INSERT INTO chat_sessions (session_id, username, session_name) VALUES (?, ?, ?)",
                     (session_id, username, f"Chat Session {datetime.now().strftime('%Y-%m-%d %H:%M')}"))
            conn.commit()

        # Load conversation history from database
        c.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC", (session_id,))
        history_rows = c.fetchall()

        conversation_history = [{"role": row[0], "content": row[1]} for row in history_rows]

        # Add current user message to history
        conversation_history.append({
            "role": "user",
            "content": message
        })

        # Create messages for API call
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + conversation_history

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=MODEL,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False
        )

        # Get response
        assistant_message = chat_completion.choices[0].message.content

        # Save both messages to database
        c.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (session_id, "user", message))
        c.execute("INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)", (session_id, "assistant", assistant_message))
        conn.commit()

        # Check for crisis keywords and trigger alerts if detected
        crisis_detected = detect_crisis_keywords(message)
        if crisis_detected:
            print(f"CRISIS DETECTED: Crisis keywords found in message from user '{username}'")
            try:
                trigger_emergency_alert(session_id, username)
            except Exception as alert_error:
                print(f"Failed to send emergency alert: {alert_error}")
                # Don't fail the response if alerts fail
        else:
            print(f"Message from user '{username}' does not contain crisis keywords")

        return jsonify({
            "success": True,
            "message": message,
            "response": assistant_message,
            "session_id": session_id,
            "crisis_detected": crisis_detected
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/clear', methods=['POST'])
def clear_history():
    """Clear conversation history for a session"""
    conn = None
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        username = data.get('username') or 'anonymous'

        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()

        # Delete all messages for this session and user
        c.execute("DELETE FROM messages WHERE session_id = ? AND session_id IN (SELECT session_id FROM chat_sessions WHERE username = ?)", (session_id, username))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Conversation history cleared"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    finally:
        if conn:
            conn.close()


def get_ai_analysis(user_input):
    """Get AI analysis of user input"""
    try:
        response = client.chat.completions.create(
            messages=[{"role": "system", "content": SYSTEM_PROMPT.format(user_input=user_input)}],
            model=MODEL,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"AI analysis failed: {e}")
        return None


def get_spotify_recommendation(emotion):
    """Get Spotify music recommendations based on emotion"""
    if not sp:
        return None
    emotion_query_map = {
        "Sadness": "Uplifting Songs", "Anxiety": "Calm Songs", "Anger": "Peaceful Music",
        "Fear": "Soothing Instrumentals", "Joy": "Happy Hits", "Neutral": "Chill Beats"
    }
    query = emotion_query_map.get(emotion, "Chill Vibes")
    try:
        results = sp.search(q=query, type='track', limit=3)
        if results and results['tracks']['items']:
            return [{"name": i['name'], "artist": i['artists'][0]['name'], "url": i['external_urls']['spotify']} for i in results['tracks']['items']]
        return None
    except:
        return None

def trigger_emergency_alert(session_id, username):
    """Trigger emergency alerts for crisis situations"""
    conn = None
    try:
        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()
        c.execute("SELECT emergency_email, emergency_phone FROM users WHERE username = ?", (username,))
        result = c.fetchone()

        if not result:
            print(f"CRISIS DETECTED: No emergency contacts found for user '{username}'.")
            return

        email_contact, phone_contact = result

        print(f"CRISIS DETECTED: Initiating emergency alerts for user '{username}'.")

        # Send Email if available
        if email_contact and '@' in email_contact:
            try:
                send_email_alert(email_contact, username)
            except Exception as e:
                print(f"Failed to send email alert: {e}")

        # Send SMS if available
        if phone_contact:
            try:
                send_sms_alert(phone_contact, username)
            except Exception as e:
                print(f"Failed to send SMS alert: {e}")

        # Send Voice Call if available
        if phone_contact:
            try:
                send_voice_alert(phone_contact, username)
            except Exception as e:
                print(f"Failed to send voice alert: {e}")

    except Exception as e:
        print(f"Error in emergency alert system: {e}")
    finally:
        if conn:
            conn.close()

def send_email_alert(recipient_email, username):
    """Send emergency email alert"""
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    if not all([sender_email, sender_password]):
        return
    msg = EmailMessage()
    msg.set_content(f"SentiBot Crisis Alert: User '{username}' may be in distress. Please check on them.")
    msg['Subject'] = f"SentiBot Crisis Alert for {username}"
    msg['From'] = sender_email
    msg['To'] = recipient_email
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        print(f"Emergency email sent to {recipient_email}.")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_sms_alert(recipient_phone, username):
    """Send emergency SMS alert"""
    if not twilio_client:
        print("SMS Alert failed: Twilio credentials missing.")
        return

    try:
        # Use messaging service if available, otherwise use phone number
        if messaging_service_sid:
            message = twilio_client.messages.create(
                body=f"SentiBot Crisis Alert: User '{username}' may be in distress. Please check on them immediately.",
                messaging_service_sid=messaging_service_sid,
                to=recipient_phone
            )
        else:
            message = twilio_client.messages.create(
                body=f"SentiBot Crisis Alert: User '{username}' may be in distress. Please check on them immediately.",
                from_=twilio_phone,
                to=recipient_phone
            )
        print(f"Emergency SMS sent to {recipient_phone}. SID: {message.sid}")
    except Exception as e:
        print(f"Failed to send SMS to {recipient_phone}. Error: {e}")
        if "21219" in str(e):
            print("Trial Account: You must verify this phone number in your Twilio Console first.")
        elif "21408" in str(e):
            print("Invalid phone number format. Please check the recipient phone number.")

def send_voice_alert(recipient_phone, username):
    """Send emergency voice call alert"""
    if not twilio_client:
        print("Voice Alert failed: Twilio credentials missing.")
        return

    try:
        # Create TwiML for voice message
        twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">This is an emergency alert from SentiBot. User {username} may be in distress. Please check on them immediately.</Say></Response>'

        call = twilio_client.calls.create(
            twiml=twiml,
            to=recipient_phone,
            from_=twilio_phone
        )
        print(f"Emergency voice call initiated to {recipient_phone}. SID: {call.sid}")
    except Exception as e:
        print(f"Failed to initiate voice call to {recipient_phone}. Error: {e}")
        if "21219" in str(e):
            print("Trial Account: You must verify this phone number in your Twilio Console first.")
        elif "21408" in str(e):
            print("Invalid phone number format. Please check the recipient phone number.")

# --- NEW API ENDPOINTS ---

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT password_hash, email, phone, emergency_email, emergency_phone, last_login, streak_count, theme_preference FROM users WHERE username = ?", (username,))
    result = c.fetchone()

    if result and result[0] == hash_password(password):
        last_login = result[5]
        streak = result[6] if result[6] else 0
        today = datetime.now().date().isoformat()

        if last_login != today:
            yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()
            if last_login == yesterday:
                streak += 1
            else:
                streak = 1
            c.execute("UPDATE users SET last_login = ?, streak_count = ? WHERE username = ?", (today, streak, username))
            conn.commit()

        conn.close()
        return jsonify({
            "success": True,
            "username": username,
            "email": result[1] or "",
            "phone": result[2] or "",
            "streak": streak,
            "theme": result[7] or "Blue (Default)",
            "emergency_email": result[3] or "",
            "emergency_phone": result[4] or ""
        })
    else:
        conn.close()
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    phone = data.get('phone', '')

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    if c.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "Username already exists"}), 409

    today = datetime.now().date().isoformat()
    c.execute("INSERT INTO users (username, password_hash, email, phone, emergency_email, emergency_phone, last_login, streak_count, theme_preference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              (username, hash_password(password), email, phone, '', '', today, 1, "Blue (Default)"))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Account created successfully"})

@app.route('/api/chat_sessions', methods=['GET'])
def get_chat_sessions():
    """Get user's chat sessions"""
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT session_id, session_name FROM chat_sessions WHERE username = ? ORDER BY timestamp DESC", (username,))
    sessions = [{"id": row[0], "name": row[1]} for row in c.fetchall()]
    conn.close()

    return jsonify({"success": True, "sessions": sessions})

@app.route('/api/messages/<session_id>', methods=['GET'])
def get_messages(session_id):
    """Get messages for a specific session"""
    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC", (session_id,))
    messages = [{"role": row[0], "content": row[1]} for row in c.fetchall()]
    conn.close()

    return jsonify({"success": True, "messages": messages})

@app.route('/api/chat_sessions/<session_id>', methods=['DELETE'])
def delete_chat_session(session_id):
    """Delete a chat session"""
    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    c.execute("DELETE FROM chat_sessions WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/wellness/affirmation', methods=['GET'])
def get_affirmation():
    """Get a random positive affirmation"""
    affirmation = random.choice(POSITIVE_AFFIRMATIONS)
    return jsonify({"success": True, "affirmation": affirmation})

@app.route('/api/wellness/breathing', methods=['GET'])
def get_breathing_exercise():
    """Get breathing exercise instructions"""
    return jsonify({"success": True, "exercise": BREATHING_EXERCISE_INSTRUCTIONS})

@app.route('/api/wellness/meditation', methods=['GET'])
def get_meditation():
    """Get guided meditation script"""
    return jsonify({"success": True, "meditation": GUIDED_MEDITATION_SCRIPT})


@app.route('/api/journal', methods=['POST'])
def save_journal_entry():
    """Save a journal entry"""
    conn = None
    try:
        data = request.json
        username = data.get('username')
        content = data.get('content')

        if not username or not content:
            return jsonify({"success": False, "error": "Username and content required"}), 400

        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()
        c.execute("INSERT INTO journal_entries (username, timestamp, content) VALUES (?, ?, ?)",
                  (username, datetime.now().isoformat(), content))
        conn.commit()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/journal', methods=['GET'])
def get_journal_entries():
    """Get user's journal entries"""
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT timestamp, content FROM journal_entries WHERE username = ? ORDER BY timestamp DESC", (username,))
    entries = [{"timestamp": row[0], "content": row[1]} for row in c.fetchall()]
    conn.close()

    return jsonify({"success": True, "entries": entries})

@app.route('/api/goals', methods=['POST'])
def save_goal():
    """Save a new goal"""
    conn = None
    try:
        data = request.json
        username = data.get('username')
        content = data.get('content')

        if not username or not content:
            return jsonify({"success": False, "error": "Username and content required"}), 400

        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()
        c.execute("INSERT INTO goals (username, content, status, timestamp) VALUES (?, ?, ?, ?)",
                  (username, content, 'In Progress', datetime.now().isoformat()))
        conn.commit()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/goals', methods=['GET'])
def get_goals():
    """Get user's goals"""
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT goal_id, content, status FROM goals WHERE username = ? ORDER BY timestamp DESC", (username,))
    goals = [{"id": row[0], "content": row[1], "status": row[2]} for row in c.fetchall()]
    conn.close()

    return jsonify({"success": True, "goals": goals})

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
def update_goal_status(goal_id):
    """Update goal status"""
    data = request.json
    status = data.get('status')

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("UPDATE goals SET status = ? WHERE goal_id = ?", (status, goal_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """Delete a goal"""
    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("DELETE FROM goals WHERE goal_id = ?", (goal_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/mood_history', methods=['GET'])
def get_mood_history():
    """Get user's mood history"""
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    query = "SELECT m.emotion FROM messages m JOIN chat_sessions s ON m.session_id = s.session_id WHERE s.username = ? AND m.role = 'user'"
    emotions = [row[0] for row in c.execute(query, (username,)).fetchall() if row[0]]
    conn.close()

    # Count emotions
    emotion_counts = {}
    for emotion in emotions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    return jsonify({"success": True, "mood_history": emotion_counts})

@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Get user profile data"""
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("SELECT email, phone, emergency_email, emergency_phone, theme_preference FROM users WHERE username = ?", (username,))
    result = c.fetchone()
    conn.close()

    if result:
        return jsonify({
            "success": True,
            "email": result[0] or "",
            "phone": result[1] or "",
            "emergency_email": result[2] or "",
            "emergency_phone": result[3] or "",
            "theme": result[4] or "Blue (Default)"
        })
    else:
        return jsonify({"success": False, "error": "User not found"}), 404

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    data = request.json
    username = data.get('username')
    personal_email = data.get('email', '')
    personal_phone = data.get('phone', '')
    emergency_email = data.get('emergency_email', '')
    emergency_phone = data.get('emergency_phone', '')
    theme = data.get('theme', 'Blue (Default)')

    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400

    conn = sqlite3.connect('sentibot.db')
    c = conn.cursor()
    c.execute("UPDATE users SET email = ?, phone = ?, emergency_email = ?, emergency_phone = ?, theme_preference = ? WHERE username = ?",
              (personal_email, personal_phone, emergency_email, emergency_phone, theme, username))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/fcm/register', methods=['POST'])
def register_fcm_token():
    """Register FCM token for push notifications"""
    data = request.json
    fcm_token = data.get('fcm_token')
    username = data.get('username')
    
    if not fcm_token or not username:
        return jsonify({"success": False, "error": "FCM token and username required"}), 400
    
    conn = None
    try:
        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()
        
        # Create fcm_tokens table if it doesn't exist
        c.execute('''CREATE TABLE IF NOT EXISTS fcm_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            fcm_token TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, fcm_token)
        )''')
        
        # Insert or update FCM token
        c.execute('''INSERT OR REPLACE INTO fcm_tokens (username, fcm_token)
                     VALUES (?, ?)''', (username, fcm_token))
        conn.commit()
        
        print(f"FCM token registered for user '{username}'")
        return jsonify({"success": True, "message": "FCM token registered successfully"})
        
    except Exception as e:
        print(f"Error registering FCM token: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/fcm/send', methods=['POST'])
def send_fcm_notification():
    """Send FCM notification to a user"""
    data = request.json
    username = data.get('username')
    title = data.get('title', 'SentiBot Notification')
    body = data.get('body', 'You have a new notification')
    
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400
    
    conn = None
    try:
        conn = sqlite3.connect('sentibot.db', timeout=10.0)
        c = conn.cursor()
        
        # Get FCM tokens for the user
        c.execute("SELECT fcm_token FROM fcm_tokens WHERE username = ?", (username,))
        tokens = [row[0] for row in c.fetchall()]
        
        if not tokens:
            return jsonify({"success": False, "error": "No FCM tokens found for user"}), 404
        
        # Send notification to all tokens
        from firebase_admin import messaging
        
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            tokens=tokens
        )
        
        response = messaging.send_multicast(message)
        print(f"FCM notification sent to user '{username}': {response.success_count} successful, {response.failure_count} failed")
        
        return jsonify({
            "success": True,
            "message": f"Notification sent to {response.success_count} device(s)",
            "success_count": response.success_count,
            "failure_count": response.failure_count
        })
        
    except Exception as e:
        print(f"Error sending FCM notification: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    print("Starting SentiBot API Server...")
    print("Server running at: http://localhost:5000")
    print("API endpoints:")
    print("   - POST /api/analyze - Analyze sentiment")
    print("   - POST /api/clear - Clear conversation history")
    print("   - GET /api/health - Health check")
    print("   - POST /api/login - User login")
    print("   - POST /api/signup - User signup")
    print("   - GET /api/chat_sessions - Get chat sessions")
    print("   - GET /api/messages/<session_id> - Get messages")
    print("   - DELETE /api/chat_sessions/<session_id> - Delete session")
    print("   - GET /api/wellness/affirmation - Get affirmation")
    print("   - GET /api/wellness/breathing - Get breathing exercise")
    print("   - GET /api/wellness/meditation - Get meditation")
    print("   - GET /api/music/recommend - Get music recommendations")
    print("   - POST /api/journal - Save journal entry")
    print("   - GET /api/journal - Get journal entries")
    print("   - POST /api/goals - Save goal")
    print("   - GET /api/goals - Get goals")
    print("   - PUT /api/goals/<goal_id> - Update goal status")
    print("   - DELETE /api/goals/<goal_id> - Delete goal")
    print("   - GET /api/mood_history - Get mood history")
    print("   - PUT /api/profile - Update profile")
    app.run(debug=True, port=5000)
