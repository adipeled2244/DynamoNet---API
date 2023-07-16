import argparse
import ast
import datetime

import mongo_utils
from config import mongo_host

def main(args):
    js_date_format = '%Y-%m-%dT%H:%M:%S.%fZ'
    print('Creating multiple time ranges for project: ' + args.project_id + ' and network: ' + args.network_id)
    args.time_windows = [{
        'title': time_window['title'] if 'title' in time_window else None,
        'start_date': datetime.datetime.strptime(time_window['startDate'], js_date_format),
        'end_date': datetime.datetime.strptime(time_window['endDate'], js_date_format)
    } for time_window in args.time_windows]
    time_ranges = mongo_utils.create_multiple_time_ranges(args.project_id, args.network_id, args.edgeType, args.edgeTypes, args.time_windows, args.favorite_nodes, mongo_host, 'test')
    pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create multiple time ranges for a project.')
    parser.add_argument('--project_id', help='The project id.', required=True)
    parser.add_argument('--network_id', help='The network id.', required=True)
    parser.add_argument('--favorite_nodes', type=ast.literal_eval, help='The favorite nodes.', required=True)
    parser.add_argument('--edgeType', help='The edge type.', required=True)
    parser.add_argument('--edgeTypes', type=ast.literal_eval, help='Project edge types.', required=True)
    parser.add_argument('--time_windows', type=ast.literal_eval, help='The time windows.', required=True)
    args = parser.parse_args()
    main(args)
