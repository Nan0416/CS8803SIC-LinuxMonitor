import base64
import os
import pickle
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from google_auth_oauthlib.flow import InstalledAppFlow

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.mail.google.com','https://www.googleapis.com/auth/gmail.send']
def create_message(sender, to, subject, message_text):
  """Create a message for an email.

  Args:
    sender: Email address of the sender.
    to: Email address of the receiver.
    subject: The subject of the email message.
    message_text: The text of the email message.

  Returns:
    An object containing a base64url encoded email object.
  """
  message = MIMEText(message_text)
  message['to'] = to
  message['from'] = sender
  message['subject'] = subject
  return {'raw': base64.urlsafe_b64encode(message.as_string().encode('utf-8')).decode('utf-8')}

def send_message(service, user_id, message):
  """Send an email message.

  Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    message: Message to be sent.

  Returns:
    Sent Message.
  """
  try:
    message = (service.users().messages().send(userId=user_id, body=message)
               .execute())
    print ('Message Id: %s' % message['id'])
    return message
  except errors.HttpError:
    print ('An error occurred: %s' % error)

def main():
    temp = "hello"
   
    msg = create_message("vijulak1995@gmail.com","vijulak1995@gmail.com","test",temp) 
    print (msg)
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
             pickle.dump(creds, token)

    service = build('gmail', 'v1', credentials=creds)
    msg = send_message(service,"vijulak1995@gmail.com",msg) 

if __name__ == '__main__':
    main()
