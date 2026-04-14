"""
SENTIBOT 2.0 - Sentiment Analysis Chatbot
Uses Groq API with Llama model for intelligent sentiment analysis
"""

import os
from groq import Groq
from dotenv import load_dotenv
from colorama import init, Fore, Style
import json

# Initialize colorama for colored terminal output
init(autoreset=True)

# Load environment variables
load_dotenv()

class SentiBot:
    def __init__(self):
        """Initialize the SentiBot with Groq API"""
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"  # Using Llama 3.3 70B model
        self.conversation_history = []

        # System prompt for conversational chatbot
        self.system_prompt = """You are SentiBot, a friendly and empathetic conversational chatbot. Your role is to:

1. Be conversational and natural in your responses
2. Respond naturally to greetings, questions, and casual conversation
3. Provide emotional support and companionship when users share feelings
4. Be helpful, empathetic, and engaging
5. Keep conversations light and supportive

Guidelines for responses:
- For greetings like "hello", "hi", "hey": Respond warmly and introduce yourself naturally
- For questions: Answer helpfully and conversationally
- For emotional sharing: Acknowledge feelings and provide supportive responses
- For casual conversation: Keep it light, engaging, and natural
- Always maintain a friendly, supportive tone

Be a good conversational companion who listens and responds naturally."""
        
    def analyze_sentiment(self, user_message):
        """
        Analyze sentiment of user message using Groq/Llama
        
        Args:
            user_message (str): The user's input text
            
        Returns:
            dict: Analysis results including sentiment, score, and response
        """
        # Add user message to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Create messages for API call
        messages = [
            {"role": "system", "content": self.system_prompt}
        ] + self.conversation_history
        
        try:
            # Call Groq API with Llama model
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False
            )
            
            # Get response
            assistant_message = chat_completion.choices[0].message.content
            
            # Add assistant response to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            # No need to parse sentiment anymore
            
            return {
                "success": True,
                "response": assistant_message
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": f"Error analyzing sentiment: {str(e)}"
            }
    
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        return "Conversation history cleared!"


def print_banner():
    """Print welcome banner"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{'SENTIBOT 2.0'.center(60)}")
    print(f"{Fore.CYAN}{'Conversational AI Chatbot'.center(60)}")
    print(f"{Fore.CYAN}{'Powered by Groq + Llama 3.3'.center(60)}")
    print(f"{Fore.CYAN}{'='*60}\n")


def print_help():
    """Print help message"""
    print(f"\n{Fore.YELLOW}Available Commands:")
    print(f"  {Fore.WHITE}/help    - Show this help message")
    print(f"  {Fore.WHITE}/clear   - Clear conversation history")
    print(f"  {Fore.WHITE}/quit    - Exit the chatbot")
    print(f"  {Fore.WHITE}Just start chatting - I'm here to talk!\n")


def main():
    """Main function to run the chatbot"""
    print_banner()
    
    try:
        # Initialize bot
        bot = SentiBot()
        print(f"{Fore.GREEN}✓ SentiBot initialized successfully!")
        print(f"{Fore.CYAN}Type '/help' for commands or just start chatting!\n")
        
        # Main conversation loop
        while True:
            try:
                # Get user input
                user_input = input(f"{Fore.BLUE}You: {Style.RESET_ALL}").strip()
                
                # Handle empty input
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.lower() == '/quit' or user_input.lower() == '/exit':
                    print(f"\n{Fore.CYAN}Thanks for using SentiBot! Goodbye! 👋\n")
                    break
                
                elif user_input.lower() == '/help':
                    print_help()
                    continue
                
                elif user_input.lower() == '/clear':
                    message = bot.clear_history()
                    print(f"\n{Fore.GREEN}{message}\n")
                    continue
                
                # Analyze sentiment
                print(f"\n{Fore.MAGENTA}Analyzing...", end="\r")
                result = bot.analyze_sentiment(user_input)
                
                if result["success"]:
                    print(f"\n{Fore.GREEN}SentiBot: {Style.RESET_ALL}{result['response']}\n")
                else:
                    print(f"\n{Fore.RED}Error: {result['error']}\n")
                    
            except KeyboardInterrupt:
                print(f"\n\n{Fore.CYAN}Thanks for using SentiBot! Goodbye! 👋\n")
                break
            except Exception as e:
                print(f"\n{Fore.RED}An error occurred: {str(e)}\n")
                
    except ValueError as e:
        print(f"{Fore.RED}✗ Configuration Error: {str(e)}")
        print(f"{Fore.YELLOW}Please set your GROQ_API_KEY in the .env file\n")
    except Exception as e:
        print(f"{Fore.RED}✗ Failed to initialize SentiBot: {str(e)}\n")


if __name__ == "__main__":
    main()
