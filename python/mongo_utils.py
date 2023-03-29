import datetime
import sys
from pymongo import MongoClient
from bson import ObjectId
import metrics_utils
import constants
import asyncio
# import aiohttp

from class_utils import Project, Network, Edge, User, TimeRange

class MongoWrapper:
    def __init__(self, mongo_host, db_name):
        self.client = MongoClient(mongo_host)
        self.db = self.client[db_name]

    def get_collection(self, collection_name):
        return self.db[collection_name]

    def insert_one(self, collection_name, document):
        collection = self.get_collection(collection_name)
        collection.insert_one(document)

    def insert_many(self, collection_name, documents):
        collection = self.get_collection(collection_name)
        collection.insert_many(documents)

    def find_one(self, collection_name, query):
        collection = self.get_collection(collection_name)
        return collection.find_one(query)

    def find(self, collection_name, query):
        collection = self.get_collection(collection_name)
        return collection.find(query)

    def find_all(self, collection_name):
        collection = self.get_collection(collection_name)
        return collection.find()

    def update_one(self, collection_name, query, update):
        collection = self.get_collection(collection_name)
        collection.update_one(query, update)

    def update_many(self, collection_name, query, update):
        collection = self.get_collection(collection_name)
        collection.update_many(query, update)

    def delete_one(self, collection_name, query):
        collection = self.get_collection(collection_name)
        collection.delete_one(query)

    def delete_many(self, collection_name, query):
        collection = self.get_collection(collection_name)
        collection.delete_many(query)

    def delete_all(self, collection_name):
        collection = self.get_collection(collection_name)
        collection.delete_many({})

    def count(self, collection_name):
        collection = self.get_collection(collection_name)
        return collection.count()

    def count_documents(self, collection_name, query):
        collection = self.get_collection(collection_name)
        return collection.count_documents(query)

    def drop_collection(self, collection_name):
        collection = self.get_collection(collection_name)
        collection.drop()

    def drop_database(self):
        self.client.drop_database(self.db)

    def close(self):
        self.client.close()

    def get_collection_names(self):
        return self.db.list_collection_names()

    def nodes_collection_setup(self):
        node_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['twitterId', 'name', 'screenName', 'location', 'description', 'followersCount', 'friendsCount', 'statusesCount', 'registrationDateTwitter'],
                'properties': {
                    'twitterId': {
                        'bsonType': 'string',
                        'description': 'must be an integer and is required',
                    },
                    'name': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'screenName': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'location': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'description': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'followersCount': {
                        'bsonType': 'int',
                        'description': 'must be an integer and is required'
                    },
                    'friendsCount': {
                        'bsonType': 'int',
                        'description': 'must be an integer and is required'
                    },
                    'statusesCount': {
                        'bsonType': 'int',
                        'description': 'must be an integer and is required'
                    },
                    'registrationDateTwitter': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required'
                    },
                }
            }
        }
        # if node collection does not exist, create it
        if 'nodes' not in self.get_collection_names():
            self.db.create_collection('nodes', validator=node_validator)
            nodes_collection = self.get_collection('nodes')
            nodes_collection.create_index('twitterId', unique=True)

    def save_users_to_node_collection(self, users):
        self.nodes_collection_setup()
        nodes_collection = self.get_collection('nodes')
        return nodes_collection.insert_many([{
            "twitterId" : str(user.id),
            "name" : user.name,
            "screenName" : user.screen_name,
            "location" : user.location,
            "description" : user.description,
            "followersCount" : user.followers_count,
            "friendsCount" : user.friends_count,
            "statusesCount" : user.statuses_count,
            "registrationDateTwitter" : user.created_at
        } for user in users], ordered=False)

    def get_users_from_node_collection_by_id(self, users_id):
        self.nodes_collection_setup()
        nodes_collection = self.get_collection('nodes')
        return nodes_collection.find({'twitterId': {'$in': [str(user_id) for user_id in users_id]}})
    
    def get_users_from_node_collection_by_screen_name(self, users_screen_names):
        self.nodes_collection_setup()
        nodes_collection = self.get_collection('nodes')
        return nodes_collection.find({'screenName': {'$in': [str(screen_name) for screen_name in users_screen_names]}})

    def edges_collection_setup(self):
        edge_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['source', 'destination', 'edgeContent', 'timestamp', 'edgeType'],
                'properties': {
                    'source': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'destination': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'edgeContent': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    },
                    'timestamp': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required'
                    },
                    'edgeType': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required'
                    }
                }
            }
        }
        # if edge collection does not exist, create it
        if 'edges' not in self.get_collection_names():
            self.db.create_collection('edges', validator=edge_validator)

    def save_edges_to_edge_collection(self, edges):
        self.edges_collection_setup()
        edges_collection = self.get_collection('edges')
        return edges_collection.insert_many([{
            "source" : str(edge.source),
            "destination" : str(edge.destination),
            "edgeContent" : edge.edgeContent,
            "timestamp" : edge.timestamp,
            "edgeType" : edge.edgeType
        } for edge in edges])

    def get_edges_from_edge_collection(self, edge_ids):
        self.edges_collection_setup()
        edges_collection = self.get_collection('edges')
        return edges_collection.find({'_id': {'$in': [ObjectId(edge) for edge in edge_ids]}})

    def get_edges_from_edge_collection_in_range(self, edge_ids, start_date, end_date):
        self.edges_collection_setup()
        edges_collection = self.get_collection('edges')
        return edges_collection.find({'_id': {'$in': [ObjectId(edge) for edge in edge_ids]}, 'timestamp': {'$gte': start_date, '$lte': end_date}})
        
    def get_edges_from_edge_collection_in_range_with_edgeType(self, edge_ids, start_date, end_date, edgeType):
        self.edges_collection_setup()
        edges_collection = self.get_collection('edges')
        return edges_collection.find({'_id': {'$in': [ObjectId(edge) for edge in edge_ids]}, 'timestamp': {'$gte': start_date, '$lte': end_date}, 'edgeType': edgeType})
     

    def networks_collection_setup(self):
        network_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['edges'],
                'properties': {
                    "networkMetrics": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    "metricsPerEdgeType": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    "retweetNetworkMetrics": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    "quoteNetworkMetrics": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    "nodeMetrics": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    'retweetCommunities': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'quoteCommunities': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'communities': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'centralNodes': {
                        'bsonType': 'object',
                        'description': 'must be an object',
                    },
                    "communitiesPerEdgeType": {
                        'bsonType': 'object',
                        'description': 'must be an object'
                    },
                    'nodes': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'nodePositions': {
                        'bsonType': 'object',
                        'description': 'must be an object',
                    },
                    'edges': {
                        'bsonType': 'array',
                        'description': 'must be an array and is required',
                        'items': {
                            'bsonType': 'objectId',
                        }
                    },
                }
            }
        }
        # if network collection does not exist, create it
        if 'networks' not in self.get_collection_names():
            self.db.create_collection('networks', validator=network_validator)

    def save_network_to_networks_collection(self, network, edges_object_ids):
        self.networks_collection_setup()
        networks_collection = self.get_collection('networks')
        return networks_collection.insert_one({
            "networkMetrics" : network.networkMetrics,
            "metricsPerEdgeType" : network.metricsPerEdgeType,
            "retweetNetworkMetrics" : network.retweetNetworkMetrics,
            "quoteNetworkMetrics" : network.quoteNetworkMetrics,
            "nodeMetrics" : network.nodeMetrics,
            "retweetCommunities": network.retweetCommunities,
            "quoteCommunities": network.quoteCommunities,
            "communities": network.communities,
            "centralNodes": network.centralNodes,
            "communitiesPerEdgeType": network.communitiesPerEdgeType,
            "nodes" : [ str(node) for node in network.nodes ],
            "nodePositions" : network.nodePositions,
            "edges" : [ ObjectId(edge_id) for edge_id in edges_object_ids ]
        })

    def update_network_to_networks_collection(self, network_id, network):
        self.networks_collection_setup()
        networks_collection = self.get_collection('networks')
        return networks_collection.update_one({
                                                '_id': ObjectId(network_id)
                                                }, 
                                                {
                                                '$set': {
                                                    "networkMetrics" : network.networkMetrics,
                                                    "metricsPerEdgeType" : network.metricsPerEdgeType,
                                                    "retweetNetworkMetrics" : network.retweetNetworkMetrics,
                                                    "quoteNetworkMetrics" : network.quoteNetworkMetrics,
                                                    "nodeMetrics" : network.nodeMetrics,
                                                }
                                            })

    def get_network_from_networks_collection_by_object_id(self, object_id):
        self.networks_collection_setup()
        networks_collection = self.get_collection('networks')
        return networks_collection.find_one({'_id': ObjectId(object_id)})

    def delete_networks_exclude_ids(self, ids):
        self.networks_collection_setup()
        networks_collection = self.get_collection('networks')
        return networks_collection.delete_many({'_id': {'$nin': [ObjectId(id) for id in ids]}})

    def update_node_in_network(self, network_id, node, node_metrics):
        self.networks_collection_setup()
        networks_collection = self.get_collection('networks')
        return networks_collection.update_one({
                                                '_id': ObjectId(network_id)
                                                }, 
                                                {
                                                '$set': {
                                                    f'nodeMetrics.{node}': node_metrics
                                                    }
                                                })

    def projects_collection_setup(self):
        project_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['createdDate', 'title', 'description', 'dataset', 'startDate', 'endDate', 'edgeType'],
                'properties': {
                    'createdDate': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required',
                    },
                    'title': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required',
                    },
                    'description': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required',
                    },
                    'dataset': {
                        'bsonType': 'array',
                        'description': 'must be an array and is required',
                        'items': {
                            'bsonType': 'string',
                        }
                    },
                    'keywords': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'startDate': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required',
                    },
                    'endDate': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required',
                    },
                    'edgeType': {
                        'bsonType': 'string',
                        'description': 'must be a string and is required',
                    },
                    'edgeTypes': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                    },
                    'timeRanges': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                        'items': {
                            'bsonType': 'objectId',
                        }
                    },
                    'sourceNetwork': {
                        'bsonType': 'objectId',
                        'description': 'must be an objectId',
                    },
                    'favoriteNodes': {
                        'bsonType': 'array',
                        'description': 'must be an array',
                        'items': {
                            'bsonType': 'string',
                        }
                    },
                    'status': {
                        'bsonType': 'string',
                        'description': 'must be a string',
                    },
                }
            }
        }
        # if project collection does not exist, create it
        if 'projects' not in self.get_collection_names():
            self.db.create_collection('projects', validator=project_validator)
            projects_collection = self.get_collection('projects')
            projects_collection.create_index('createdDate')

    def save_project_to_projects_collection(self, project, time_ranges_object_ids=None, network_object_id=None):
        if time_ranges_object_ids is None:
            time_ranges_object_ids = []
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.insert_one({
            "createdDate" : project.createdDate,
            "title" : project.title,
            "description" : project.description,
            "dataset" : project.dataset,
            "keywords" : project.keywords,
            "startDate" : project.startDate,
            "endDate" : project.endDate,
            "edgeType" : project.edgeType,
            "edgeTypes" : project.edgeTypes,
            "timeRanges" : [ ObjectId(time_range_id) for time_range_id in time_ranges_object_ids ],
            "sourceNetwork" : ObjectId(network_object_id) if network_object_id is not None else None,
            "favoriteNodes" : project.favoriteNodes,
            "status" : project.status
        })

    def get_project_from_projects_collection_by_object_id(self, object_id):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        # get project without time ranges and networks, {'timeRanges': 0, 'networks': 0}
        return projects_collection.find_one({'_id': ObjectId(object_id)})

    def get_projects_from_projects_collection(self):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.find({})

    def update_project_in_projects_collection(self, object_id, project):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.update_one({'_id': ObjectId(object_id)}, {'$set': project})

    def insert_network_into_project(self, project_id, network_object_id, edgeTypes):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        # return projects_collection.update_one({'_id': ObjectId(project_id)}, {'$set': {'sourceNetwork': ObjectId(network_object_id)}}) # , 'status': constants.project_ready
        return projects_collection.update_one({'_id': ObjectId(project_id)}, {'$set': {'sourceNetwork': ObjectId(network_object_id), 'edgeTypes': edgeTypes}})
    
    def update_project_status(self, project_id, status):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.update_one({'_id': ObjectId(project_id)}, {'$set': {'status': status}})
    
    def insert_time_range_into_project(self, project_id, time_range_object_id):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.update_one({'_id': ObjectId(project_id)}, {'$push': {'timeRanges': ObjectId(time_range_object_id)}})

    def insert_time_ranges_into_project(self, project_id, time_ranges_object_ids):
        self.projects_collection_setup()
        projects_collection = self.get_collection('projects')
        return projects_collection.update_one({'_id': ObjectId(project_id)}, {'$push': {'timeRanges': {'$each': [ObjectId(time_range_id) for time_range_id in time_ranges_object_ids]}}})

    def timeRanges_collection_setup(self):
        timeRange_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['startDate', 'endDate', 'network'],
                'properties': {
                    'startDate': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required',
                    },
                    'endDate': {
                        'bsonType': 'date',
                        'description': 'must be a date and is required',
                    },
                    'network': {
                        'bsonType': 'objectId',
                        'description': 'must be an objectId and is required',
                    },
                    'title': {
                        'bsonType': 'string',
                        'description': 'must be a string',
                    },
                }
            }
        }
        # if timeRange collection does not exist, create it
        if 'timeRanges' not in self.get_collection_names():
            self.db.create_collection('timeRanges', validator=timeRange_validator)
            timeRanges_collection = self.get_collection('timeRanges')
            timeRanges_collection.create_index('startDate')

    def save_time_range_to_timeRanges_collection(self, time_range, network_object_id):
        self.timeRanges_collection_setup()
        timeRanges_collection = self.get_collection('timeRanges')
        return timeRanges_collection.insert_one({
            "startDate" : time_range.startDate,
            "endDate" : time_range.endDate,
            "network" : ObjectId(network_object_id),
            "title" : time_range.title
        })

    def get_time_range_from_timeRanges_collection_by_object_id(self, object_id):
        self.timeRanges_collection_setup()
        timeRanges_collection = self.get_collection('timeRanges')
        return timeRanges_collection.find_one({'_id': ObjectId(object_id)})

    def get_time_ranges_from_timeRanges_collection(self):
        self.timeRanges_collection_setup()
        timeRanges_collection = self.get_collection('timeRanges')
        return timeRanges_collection.find({})

    def update_time_range_in_timeRanges_collection(self, object_id, time_range):
        self.timeRanges_collection_setup()
        timeRanges_collection = self.get_collection('timeRanges')
        return timeRanges_collection.update_one({'_id': ObjectId(object_id)}, {'$set': time_range})

def get_project(project_id, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    project = mongo.get_project_from_projects_collection_by_object_id(project_id)
    if project is None:
        return None
    mongo.close()
    return project

# async def network_layout(network_id):
#     async with aiohttp.ClientSession() as session:
#         async with session.patch(f'{constants.backend_url}{constants.graphs_api}{network_id}') as response:
#             return response


def save_network(network, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    edges_response = mongo.save_edges_to_edge_collection(network.edges)
    network_object_id = mongo.save_network_to_networks_collection(network, edges_response.inserted_ids)
    mongo.close()
    return network_object_id.inserted_id

def save_time_range(time_range, network_object_id, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    time_range_object_id = mongo.save_time_range_to_timeRanges_collection(time_range, network_object_id)
    mongo.close()
    return time_range_object_id.inserted_id

def insert_network_to_project(project_id, network_object_id, edgeTypes, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    mongo.insert_network_into_project(project_id, network_object_id, edgeTypes)
    mongo.close()



def save_users(users, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    try:
        users_response = mongo.save_users_to_node_collection(users)
    except Exception as e:
        print('error occured while saving users to node collection: (skipping most likely duplicate)', file=sys.stderr)
        # print(e, file=sys.stderr)
        mongo.close()
        return None
    mongo.close()    
    return users_response.inserted_ids

def mongo_edges_to_network_edges(mongo_edges):
    return [
        Edge(
            source=edge['source'], 
            destination=edge['destination'], 
            timestamp=edge['timestamp'], 
            edgeContent=edge['edgeContent'], 
            edgeType=edge['edgeType'] if 'edgeType' in edge else None,
            _id=edge['_id']
            ) for edge in mongo_edges]

def mongo_network_to_network(mongo_network, mongo):
    network = Network(_id=mongo_network['_id'])
    network.edges = mongo.get_edges_from_edge_collection(mongo_network['edges'])
    network.edges = [edge for edge in network.edges]
    network.edges = mongo_edges_to_network_edges(network.edges)
    if 'networkMetrics' in mongo_network:
        network.networkMetrics = mongo_network['networkMetrics']
    if 'metricsPerEdgeType' in mongo_network:
        network.metricsPerEdgeType = mongo_network['metricsPerEdgeType']
    if 'retweetNetworkMetrics' in mongo_network:
        network.retweetNetworkMetrics = mongo_network['retweetNetworkMetrics']
    if 'quoteNetworkMetrics' in mongo_network:
        network.quoteNetworkMetrics = mongo_network['quoteNetworkMetrics']
    if 'nodeMetrics' in mongo_network:
        network.nodeMetrics = mongo_network['nodeMetrics']
    if 'nodes' in mongo_network:
        network.nodes = mongo_network['nodes']
    if 'retweetCommunities' in mongo_network:
        network.retweetCommunities = mongo_network['retweetCommunities']
    if 'quoteCommunities' in mongo_network:
        network.quoteCommunities = mongo_network['quoteCommunities']
    if 'communities' in mongo_network:
        network.communities = mongo_network['communities']
    if 'communitiesPerEdgeType' in mongo_network:
        network.communitiesPerEdgeType = mongo_network['communitiesPerEdgeType']
    if 'nodePositions' in mongo_network:
        network.nodePositions = mongo_network['nodePositions']
    return network


def create_time_range(network, start_date, end_date, edgeType, mongo):
    if edgeType is None:
        edges_in_time_range_cursor = mongo.get_edges_from_edge_collection_in_range(network['edges'], start_date, end_date)
    else:
        edges_in_time_range_cursor = mongo.get_edges_from_edge_collection_in_range_with_edgeType(network['edges'], start_date, end_date, edgeType)
    time_range_edges = [edge for edge in edges_in_time_range_cursor]
    time_range_network = Network()
    time_range_network.edges = mongo_edges_to_network_edges(time_range_edges)
    time_range = TimeRange(
        startDate=start_date,
        endDate=end_date,
        network=time_range_network
    )
    return time_range



def save_time_range(time_range, project_id, mongo):
    network_object_id = mongo.save_network_to_networks_collection(time_range.network, [edge._id for edge in time_range.network.edges])
    # asyncio.run(network_layout(network_object_id.inserted_id))
    time_range_object_id = mongo.save_time_range_to_timeRanges_collection(time_range, network_object_id.inserted_id)
    return mongo.insert_time_range_into_project(project_id, time_range_object_id.inserted_id)

def merge_Networks(retweetNetwork, quoteNetwork):
    mergedNetwork = Network()
    mergedNetwork.nodes = retweetNetwork.nodes.union(quoteNetwork.nodes)
    mergedNetwork.edges = retweetNetwork.edges + quoteNetwork.edges
    mergedNetwork.retweetNetworkMetrics = retweetNetwork.networkMetrics
    mergedNetwork.quoteNetworkMetrics = quoteNetwork.networkMetrics
    return mergedNetwork

def create_multiple_time_ranges(project_id, network_id, edgeType, edgeTypes, time_windows, favorite_nodes, mongo_host, db_name):
    if edgeType == 'all':
        edgeType = None
    mongo = MongoWrapper(mongo_host, db_name)
    mongo.update_project_status(project_id, constants.project_creating_time_ranges)
    network = mongo.get_network_from_networks_collection_by_object_id(network_id)
    time_ranges = []
    index = 0
    for time_window in time_windows:
        start_date = time_window['start_date']
        end_date = time_window['end_date']
        print('creating time range from {} to {}'.format(start_date, end_date))
        if edgeType is not None:
            print('edgeType: {}'.format(edgeType))
            time_range = create_time_range(network, start_date, end_date, edgeType, mongo)
        else:
            # print('edgeType: retweet')
            # retweet_time_range = create_time_range(network, start_date, end_date, 'retweet', mongo)
            # print('edgeType: quote')
            # quote_time_range = create_time_range(network, start_date, end_date, 'quote', mongo)
            print('edgeType: all')
            overall_time_range = create_time_range(network, start_date, end_date, None, mongo)
            time_range = TimeRange(
                startDate=start_date,
                endDate=end_date,
                # network=merge_Networks(retweet_time_range.network, quote_time_range.network)
                network=overall_time_range.network
            )
            # TODO: update communities and metrics per type in project.edgeTypes 
            for type in edgeTypes:
                print('edgeType: {}'.format(type))
                temp_time_range = create_time_range(network, start_date, end_date, type, mongo)
                time_range.network.metricsPerEdgeType[type] = metrics_utils.calculateNetworkMetrics(temp_time_range.network)
                time_range.network.communitiesPerEdgeType[type] = metrics_utils.getCommunities(temp_time_range.network)
            # # TODO: remove this when swapping to dynamic edge types
            # retweetNetworkMetrics = metrics_utils.calculateNetworkMetrics(retweet_time_range.network)
            # quoteNetworkMetrics = metrics_utils.calculateNetworkMetrics(quote_time_range.network)
            # time_range.network.retweetNetworkMetrics = retweetNetworkMetrics
            # time_range.network.quoteNetworkMetrics = quoteNetworkMetrics
            # time_range.network.retweetCommunities = metrics_utils.getCommunities(retweet_time_range.network)
            # time_range.network.quoteCommunities = metrics_utils.getCommunities(quote_time_range.network)
            
        print('calculating network metrics')
        networkMetrics = metrics_utils.calculateNetworkMetrics(time_range.network)
        time_range.network.networkMetrics = networkMetrics
        time_range.network.communities = metrics_utils.getCommunities(time_range.network)
        time_range.network.centralNodes = {
            'betweenness': metrics_utils.getCentralNodes(time_range.network, 'betweenness'),
            'closeness': metrics_utils.getCentralNodes(time_range.network, 'closeness'),
            'degree': metrics_utils.getCentralNodes(time_range.network, 'degree'),
        }
        print('calculating node metrics')
        for node_id in favorite_nodes:
            node_metrics = metrics_utils.calculateNodeMetrics(time_range.network, node_id)
            time_range.network.nodeMetrics[node_id] = node_metrics
        print('saving time range')
        if 'title' in time_window:
            time_range.title = time_window['title']
        else:
            time_range.title = 'time range {}'.format(index)
        index += 1
        save_time_range(time_range, project_id, mongo)
        time_ranges.append(time_range)
    mongo.update_project_status(project_id, constants.project_ready)
    mongo.close()
    return time_ranges

def update_node_metrics_in_project(project_id, screen_name, mongo_host, db_name):
    mongo = MongoWrapper(mongo_host, db_name)
    mongo.update_project_status(project_id, constants.project_calculating_node_metrics)
    project = mongo.get_project_from_projects_collection_by_object_id(project_id)
    if project is None:
        mongo.close()
        return
    time_ranges = project['timeRanges']
    for time_range_id in time_ranges:
        time_range = mongo.get_time_range_from_timeRanges_collection_by_object_id(time_range_id)
        network = mongo.get_network_from_networks_collection_by_object_id(time_range['network'])        
        network = mongo_network_to_network(network, mongo)
        node_metrics = metrics_utils.calculateNodeMetrics(network, screen_name)
        network.nodeMetrics[screen_name] = node_metrics
        mongo.update_node_in_network(network._id, screen_name, node_metrics)
    mongo.update_project_status(project_id, constants.project_ready)
    mongo.close()