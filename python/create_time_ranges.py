import argparse
import ast
import datetime

def main(args):
    js_date_format = '%Y-%m-%dT%H:%M:%S.%fZ'
    print('Creating multiple time ranges for project: ' + args.project_id + ' and network: ' + args.network_id)
    # create time ranges
    for time_window in args.time_windows:
        print('Creating time range: ' + str(datetime.datetime.strptime(time_window['start_date'], js_date_format)) + ' to ' + str(datetime.datetime.strptime(time_window['end_date'], js_date_format)))
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
