from config import bearer_token, consumer_key, consumer_secret, access_token, access_token_secret, client_id, client_secret, mongo_host, email_address, email_password, app_password

import data_importer
import class_utils
import constants
import mongo_utils
import metrics_utils
import csv
from class_utils import Project, Network, Edge, User, TimeRange, TweepyWrapper
from mongo_utils import MongoWrapper
from bson import ObjectId
from datetime import datetime
from dateutil import parser

def read_csv(file_path):
    with open(file=file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        data = list(csv_reader)
    return data

def main(project_id, csv_file, db_name='test'):
    project = mongo_utils.get_project(project_id, mongo_host=mongo_host, db_name=db_name)
    if project is None:
        print('Project not found')
        return
    
    csv_edges = read_csv(csv_file)
    csv_edges_columns = {
        'source': 0,
        'destination': 1,
        'edgeContent': 2,
        'timestamp': 3,
        'edgeType': 4,
    }

    csv_edges = csv_edges[1:] # remove header
    edges = []
    # parser.parse
    for edge in csv_edges:
        edges.append(Edge(
            source=edge[csv_edges_columns['source']],
            destination=edge[csv_edges_columns['destination']],
            edgeContent=edge[csv_edges_columns['edgeContent']],
            timestamp=parser.parse(edge[csv_edges_columns['timestamp']]),
            edgeType=edge[csv_edges_columns['edgeType']],
        ))

    nodes_set = set()
    for edge in edges:
        nodes_set.add(edge.source)
        nodes_set.add(edge.destination)

    users_dict = data_importer.get_users_by_screen_name_from_mongo(list(nodes_set))
    missing_users = [ user for user in nodes_set if user not in users_dict ]
    # missing_users_dict = data_importer.get_users_by_screen_name_from_twitter(missing_users)
    tweepyWrapper = TweepyWrapper(bearer_token, consumer_key, consumer_secret, access_token, access_token_secret)
    missing_users_list = data_importer.get_users(tweepyWrapper, missing_users)

    for user in missing_users_list:
        users_dict[user.screen_name] = user

    mongo_utils.save_users(users_dict.values(), mongo_host, 'test')

    for edge in edges:
        edge.source = users_dict[edge.source]
        edge.destination = users_dict[edge.destination]

    network = Network()
    network.nodes = list(users_dict.keys())
    network.edges = edges

    edgeTypes = set()
    for edge in edges:
        edgeTypes.add(edge.edgeType)

    for type in edgeTypes:
        temp_network = Network()
        for edge in network.edges:
            if edge.edgeType == type:
                temp_network.edges.append(edge)
                temp_network.nodes.add(edge.source.screen_name)
                temp_network.nodes.add(edge.destination.screen_name)
        temp_network.networkMetrics = metrics_utils.calculateNetworkMetrics(temp_network)
        temp_network.communities = metrics_utils.getCommunities(temp_network)
        network.metricsPerEdgeType[type] = temp_network.networkMetrics
        network.communitiesPerEdgeType[type] = temp_network.communities

    network.networkMetrics = metrics_utils.calculateNetworkMetrics(network)
    network.communities = metrics_utils.getCommunities(network)

    network_object_id = mongo_utils.save_network(network, mongo_host, 'test')

    minDate = network.edges[0].timestamp
    maxDate = network.edges[0].timestamp
    for edge in network.edges:
        if edge.timestamp < minDate:
            minDate = edge.timestamp
        if edge.timestamp > maxDate:
            maxDate = edge.timestamp


    mongo = MongoWrapper(mongo_host, 'test')
    project = Project(
        title=project['title'],
        description=project['description'],
        dataset=[],
        keywords=[],
        startDate=minDate,
        endDate=maxDate,
        edgeType='all',
        edgeTypes=list(edgeTypes),
        timeRanges=[],
        sourceNetwork=network_object_id,
        favoriteNodes=[],
        status='ready'
    )
    mongo.update_project_in_projects_collection(project_id, project)


import argparse
import data_importer
import mail_sender
import os

if __name__ == '__main__':
    # get project_id,  from command line
    argParser = argparse.ArgumentParser()
    argParser.add_argument('--project_id', help='Project ID', required=True)
    argParser.add_argument('--csv_file', help='CSV file location', required=True)
    argParser.add_argument('--user_email', help='User email', required=False)
    args = argParser.parse_args()
    try:
        main(args.project_id, args.csv_file)
    except Exception as e:
        mongo = MongoWrapper(mongo_host, 'test')
        mongo.update_project_status(args.project_id, constants.project_failed)
    finally:
        os.remove(args.csv_file)
    if args.user_email is not None:
        subject = 'DynamoNet'
        message = 'Your project has been successfully processed!'
        mail_sender.send_email(args.user_email, subject, message)
