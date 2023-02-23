import argparse

def main(args):
    print('Project ID: {}'.format(args.project_id))
    print(args.datesArray)
    # send mail to user
    # send_mail(args.project_id, 'Your project is ready to be downloaded', 'Your project is ready to be downloaded. Please click on the link below to download your project.')

if __name__ == '__main__':
    # get project_id, start_date, end_date from command line
    parser = argparse.ArgumentParser()
    parser.add_argument('--project_id', help='Project ID', required=True)
    parser.add_argument('--datesArray',nargs="+", help='datesArray', required=True)
    args = parser.parse_args()
    main(args)

# example command line
# python .\virtual_twitter.py --project_id=9a8sd9aas
    