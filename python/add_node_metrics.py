import argparse
import mongo_utils
from config import mongo_host
def main(args):
    mongo_utils.update_node_metrics_in_project(args.project_id, args.screen_name, mongo_host, db_name='test')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--project_id', help='Project ID', required=True)
    parser.add_argument('--screen_name', help='Username on twitter', required=True)
    args = parser.parse_args()
    main(args)