import argparse
import ast
import datetime

import mongo_utils

def main(args):
    js_date_format = '%Y-%m-%dT%H:%M:%S.%fZ'
    print('Creating multiple time ranges for project: ' + args.project_id + ' and network: ' + args.network_id)
    args.time_windows = [{
        'start_date': datetime.datetime.strptime(time_window['startDate'], js_date_format).strftime(js_date_format),
        'end_date': datetime.datetime.strptime(time_window['endDate'], js_date_format).strftime(js_date_format)
    } for time_window in args.time_windows]
    # create time ranges
    for time_window in args.time_windows:
        print('Creating time range: ' + 
        str(time_window['start_date']) + ' to ' + 
        str(time_window['end_date']) )
        # create time range
        # insert time range into project
    pass

if __name__ == '__main__':
    # get project_id, network_id, and time_windows list of objects from command line
    parser = argparse.ArgumentParser(description='Create multiple time ranges for a project.')
    parser.add_argument('--project_id', help='The project id.', required=True)
    parser.add_argument('--network_id', help='The network id.', required=True)
    parser.add_argument('--time_windows', type=ast.literal_eval, help='The time windows.', required=True)
    args = parser.parse_args()
    main(args)
