import argparse
import data_importer
import mail_sender

def main(args):
    limit = None
    if args.limit is not None:
        limit = int(args.limit)
    data_importer.import_data(project_id=args.project_id, limit=limit)
    if args.user_email is not None:
        subject = 'DynamoNet'
        message = 'Your project has been successfully processed!'
        mail_sender.send_email(args.user_email, subject, message)

if __name__ == '__main__':
    # get project_id,  from command line
    parser = argparse.ArgumentParser()
    parser.add_argument('--project_id', help='Project ID', required=True)
    # get optional argument limit and user_email
    parser.add_argument('--user_email', help='User email', required=False)
    parser.add_argument('--limit', help='Limit', required=False)
    args = parser.parse_args()
    main(args)

# example command line
# python3 virtual_twitter.py --project_id=63f75a3e60d069861c5f2670 --user_email=look15up@gmail.com --limit=2