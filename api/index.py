import os
import sys

# Add the project root to the python path so python can resolve backend.app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
