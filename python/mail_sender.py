import argparse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import email_address, app_password

def send_email(to_email, subject, message):
    # create message object instance
    msg = MIMEMultipart()
    msg['From'] = email_address
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    # create server
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(email_address, app_password)

    # send email
    text = msg.as_string()
    server.sendmail(email_address, to_email, text)
    server.quit()

if __name__ == '__main__':
    # get email, subject, message from command line
    parser = argparse.ArgumentParser()
    parser.add_argument('--email', help='Email address', required=True)
    parser.add_argument('--subject', help='Email subject', required=True)
    parser.add_argument('--message', help='Email message', required=True)
    args = parser.parse_args()
    send_email(args.email, args.subject, args.message)
