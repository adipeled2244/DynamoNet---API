import argparse

def main(args):
    print('Project ID: {}'.format(args.project_id))
    # send mail to user
    # send_mail(args.project_id, 'Your project is ready to be downloaded', 'Your project is ready to be downloaded. Please click on the link below to download your project.')

if __name__ == '__main__':
    # get project_id, start_date, end_date from command line
    parser = argparse.ArgumentParser()
    parser.add_argument('--project_id', help='Project ID', required=True)
    # get dataset array of strings
    parser.add_argument('--datasets', nargs='+', help='Datasets', required=True)
    # get start_date and end_date
    parser.add_argument('--start_date', help='Start Date', required=True)
    parser.add_argument('--end_date', help='End Date', required=True)
    args = parser.parse_args()
    main(args)

# example command line
# python .\virtual_twitter.py --project_id=9a8sd9aas --datasets=twitter_users twitter_tweets twitter_followers twitter_friends twitter_retweets twitter_mentions --start_date=2020-01-01 --end_date=2020-01-31
    