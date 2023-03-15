# required packages:
# pip install tweepy
# pip install pytz
# pip install pymongo


import asyncio
import pytz
from config import bearer_token, consumer_key, consumer_secret, access_token, access_token_secret
from config import mongo_host
import constants

from class_utils import Project, TimeRange, Network, User, Edge, TweepyWrapper, Tweet
import mongo_utils
from mongo_utils import MongoWrapper
import metrics_utils

def get_users(tweepyWrapper, screen_names):
    users = []
    # get users in batches of 100
    for i in range(0, len(screen_names), 100):
        try:
            users.extend(tweepyWrapper.get_users(screen_names[i:i+100]))
        except:
            continue

    # get remaining users
    try:
        users.extend(tweepyWrapper.get_users(screen_names[len(users):]))
    except:
        pass

    # create user objects
    userList = []
    for user in users:
        userList.append(
            User(
                id=user.id, 
                name=user.name, 
                screen_name=user.screen_name, 
                location=user.location, 
                description=user.description, 
                followers_count=user.followers_count, 
                friends_count=user.friends_count, 
                statuses_count=user.statuses_count, 
                created_at=user.created_at
                )
            )
    return userList

def get_tweets_by_users(tweepyWrapper, users, start_date, end_date, limit=None):
    tweetList = []
    for user in users:
        tweets = tweepyWrapper.get_user_tweets(user.screen_name, start_date, end_date, limit=limit)
        for tweet in tweets:
            tweetList.append(
                Tweet(
                    id=tweet.id,
                    text=tweet.text,
                    created_at=tweet.created_at,
                    user=user
                    )
                )
    return tweetList

def get_tweets_by_keywords(tweepyWrapper, keywords, start_date, end_date, limit=None):
    tweetList = []
    # keyword_query = ' OR '.join(keywords)
    # concatenate keywords with OR up to 1024 characters
    # then run query
    keyword_query = ''
    for keyword in keywords:
        if len(keyword_query) + len(keyword) + 4 > 1024:
            tweets = tweepyWrapper.get_tweets_by_keyword(keyword_query, start_date, end_date, limit=limit)
            for tweet in tweets:
                tweetList.append(
                    Tweet(
                        id=tweet.id,
                        text=tweet.text,
                        created_at=tweet.created_at,
                        user=tweet.user.id
                        )
                    )
            keyword_query = ''
        keyword_query += keyword + ' OR '
    if len(keyword_query) > 0:
        keyword_query = keyword_query[:-4]
        tweets = tweepyWrapper.get_tweets_by_keyword(keyword_query, start_date, end_date, limit=limit)
        for tweet in tweets:
            tweetList.append(
                Tweet(
                    id=tweet.id,
                    text=tweet.text,
                    created_at=tweet.created_at,
                    user=tweet.user.id
                    )
                )
    return tweetList


def get_retweets_network(tweepyWrapper, tweets, start_date, end_date, limit=None):
    start_date = pytz.utc.localize(start_date)
    end_date = pytz.utc.localize(end_date)
    retweetNetwork = Network()
    for tweet in tweets:
        retweetNetwork.nodes.add(tweet.user.screen_name)
        retweets = tweepyWrapper.get_retweets(tweet.id)
        limit_per_tweet = limit
        for retweet in retweets:
            if retweet.created_at < start_date or retweet.created_at > end_date:
                continue
            retweetNetwork.edges.append(
                Edge(
                    source=retweet.user.id,
                    destination=tweet.user,
                    timestamp=retweet.created_at,
                    edgeContent=f'Original Tweet ID: ${tweet.id}. Retweet ID: ${retweet.id}. Retweet Text: ${retweet.text}',
                    edgeType='retweet'
                )
            )
            retweetNetwork.nodes.add(retweet.user.screen_name)
            if limit_per_tweet is not None:
                limit_per_tweet -= 1
                if limit_per_tweet == 0:
                    break
    return retweetNetwork

def get_quotes_network(tweepyWrapper, tweets, start_date, end_date, limit=None):
    quoteNetwork = Network()
    for tweet in tweets:
        quoteNetwork.nodes.add(tweet.user.screen_name)
        quotes = tweepyWrapper.get_quote_tweets(tweet.id, start_date, end_date, limit=limit)
        for quote in quotes:
            quoteNetwork.edges.append(
                Edge(
                    source=quote.author_id,
                    destination=tweet.user,
                    timestamp=quote.created_at,
                    edgeContent=f'Original Tweet ID: ${tweet.id}. Quote Tweet ID: ${quote.id}. Quote Tweet Text: ${quote.text}',
                    edgeType='quote'
                )
            )
            
    return quoteNetwork

def merge_Networks(retweetNetwork, quoteNetwork):
    mergedNetwork = Network()
    mergedNetwork.nodes = retweetNetwork.nodes.union(quoteNetwork.nodes)
    mergedNetwork.edges = retweetNetwork.edges + quoteNetwork.edges
    mergedNetwork.retweetNetworkMetrics = retweetNetwork.networkMetrics
    mergedNetwork.quoteNetworkMetrics = quoteNetwork.networkMetrics
    return mergedNetwork

def get_user_ids_from_network_source_nodes(network, exclude_users=None):
    if exclude_users is None:
        exclude_users = []
    source_users = set()
    for edge in network.edges:
        if edge.source not in exclude_users:
            source_users.add(edge.source)
    return list(source_users)

def get_users_by_id_as_dict(tweepyWrapper, user_ids):
    users = []
    # get users in batches of 100
    for i in range(0, len(user_ids), 100):
        try:
            users.extend(tweepyWrapper.get_users_by_id(user_ids[i:i+100]))
        except:
            continue

    # get remaining users
    try:
        users.extend(tweepyWrapper.get_users_by_id(user_ids[len(users):]))
    except:
        pass

    # create user objects
    userList = {
        user.id: User(
            id=user.id,
            name=user.name,
            screen_name=user.screen_name,
            location=user.location,
            description=user.description,
            followers_count=user.followers_count,
            friends_count=user.friends_count,
            statuses_count=user.statuses_count,
            created_at=user.created_at
        )   for user in users
    }
    return userList

def get_users_by_id_from_mongo(user_ids):
    mongo = MongoWrapper(mongo_host, 'test')
    users = mongo.get_users_from_node_collection_by_id(user_ids)

    # create user objects
    userList = {
        user['twitterId']: User(
            id=user['twitterId'],
            name=user['name'],
            screen_name=user['screenName'],
            location=user['location'],
            description=user['description'],
            followers_count=user['followersCount'],
            friends_count=user['friendsCount'],
            statuses_count=user['statusesCount'],
            created_at=user['registrationDateTwitter']
        )   for user in users
    }
    mongo.close()
    return userList

def replace_source_ids_with_users(network, user_dict):
    for edge in network.edges:
        try:
            edge.source = user_dict[edge.source]
        except:
            network.edges.remove(edge)

def remove_edges_with_missing_users(network):
    for edge in network.edges:
        if type(edge.source) != User or type(edge.destination) != User:
            network.edges.remove(edge)

def import_data(project_id, limit=None, db_name='test'):
    project = mongo_utils.get_project(project_id, mongo_host=mongo_host, db_name=db_name)
    if project is None:
        print('Project not found')
        return

    dataset = project['dataset']
    keywords = project['keywords']
    startDate = project['startDate']
    endDate = project['endDate']

    print('Dataset: ', dataset)
    print('Start date: ', startDate)
    print('End date: ', endDate)

    # set up tweepy wrapper
    tweepyWrapper = TweepyWrapper(bearer_token, consumer_key, consumer_secret, access_token, access_token_secret)

    initial_users = []
    tweetList = []
    if len(dataset) > 0:
        # get initial users
        initial_users = get_users(tweepyWrapper, dataset)
        print('Initial users len: ', len(initial_users))
        # save initial_users to mongo
        mongo_utils.save_users(initial_users, mongo_host=mongo_host, db_name=db_name)

        # get initial users' tweets
        tweetList.extend(get_tweets_by_users(tweepyWrapper, initial_users, startDate, endDate, limit=limit))
        print('Tweet list len by users: ', len(tweetList))
    
    if len(keywords) > 0:
        # get tweets by keywords
        tweets_by_keyword = get_tweets_by_keywords(tweepyWrapper, keywords, startDate, endDate, limit=limit)
        print('Tweet list len by keywords: ', len(tweets_by_keyword))
        user_ids_by_keyword = [tweet.user for tweet in tweets_by_keyword]
        users_dict = get_users_by_id_from_mongo(user_ids_by_keyword)
        missing_users = [user_id for user_id in user_ids_by_keyword if user_id not in users_dict]
        missing_users_dict = get_users_by_id_as_dict(tweepyWrapper, missing_users)
        users_dict.update(missing_users_dict)
        for tweet in tweets_by_keyword:
            tweet.user = users_dict[tweet.user]
        tweetList.extend(tweets_by_keyword)

    if len(tweetList) == 0:
        print('No tweets found')
        mongo = MongoWrapper(mongo_host, 'test')
        mongo.update_project_status(project_id, constants.project_ready)
        return

    
    # build retweet network
    retweetNetwork = get_retweets_network(tweepyWrapper, tweetList, startDate, endDate, limit=limit)
    print('Retweet network len: ', len(retweetNetwork.edges))
    
    # get source users from retweet network
    sourceUsers = get_user_ids_from_network_source_nodes(retweetNetwork)
    print('Source users len: ', len(sourceUsers))

    # get users by id
    source_users_dict = get_users_by_id_from_mongo(sourceUsers)
    missing_source_users = [user_id for user_id in sourceUsers if user_id not in source_users_dict]

    missing_source_users_dict = get_users_by_id_as_dict(tweepyWrapper, missing_source_users)
    source_users_dict.update(missing_source_users_dict)
    print('Source users dict len: ', len(source_users_dict))

    # replace source ids with user objects
    replace_source_ids_with_users(retweetNetwork, source_users_dict)
    remove_edges_with_missing_users(retweetNetwork)

    # calculate retweet network metrics
    retweetNetworkMetrics = metrics_utils.calculateNetworkMetrics(retweetNetwork)
    retweetNetwork.networkMetrics = retweetNetworkMetrics

    # build quote network
    quoteNetwork = get_quotes_network(tweepyWrapper, tweetList, startDate, endDate)
    
    # get source users from quote network
    missing_source_users = get_user_ids_from_network_source_nodes(quoteNetwork, exclude_users=sourceUsers)

    # get missing users by id
    missing_source_users_dict = get_users_by_id_from_mongo(missing_source_users)
    missing_source_users = [user_id for user_id in missing_source_users if user_id not in missing_source_users_dict]
    missing_source_users_dict2 = get_users_by_id_as_dict(tweepyWrapper, missing_source_users)
    missing_source_users_dict.update(missing_source_users_dict2)

    # updated source_users_dict
    source_users_dict.update(missing_source_users_dict)

    # replace source ids with user objects
    replace_source_ids_with_users(quoteNetwork, source_users_dict)
    remove_edges_with_missing_users(quoteNetwork)
    
    # add missing users to quote network's nodes
    for edge in quoteNetwork.edges:
        quoteNetwork.nodes.add(edge.source)
        quoteNetwork.nodes.add(edge.destination)

    # calculate network metrics
    quoteNetworkMetrics = metrics_utils.calculateNetworkMetrics(quoteNetwork)
    quoteNetwork.networkMetrics = quoteNetworkMetrics

    # merge networks into one
    mergedNetwork = merge_Networks(retweetNetwork, quoteNetwork)

    # calculate network metrics
    mergedNetworkMetrics = metrics_utils.calculateNetworkMetrics(mergedNetwork)
    mergedNetwork.networkMetrics = mergedNetworkMetrics
    
    # save source_users_dict to mongo
    mongo_utils.save_users(list(source_users_dict.values()), mongo_host=mongo_host, db_name=db_name)

    # save mergedNetwork to mongo
    mergedNetwork_object_id = mongo_utils.save_network(mergedNetwork, mongo_host=mongo_host, db_name=db_name)

    # insert network id into project
    mongo_utils.insert_network_to_project(project_id, mergedNetwork_object_id, mongo_host=mongo_host, db_name=db_name)

    # 
    mergedNetwork.retweetCommunities = metrics_utils.getCommunities(retweetNetwork)
    mergedNetwork.quoteCommunities = metrics_utils.getCommunities(quoteNetwork)
    mergedNetwork.communities = metrics_utils.getCommunities(mergedNetwork)

    mongo = MongoWrapper(mongo_host, 'test')
    try:
        networks_collection = mongo.get_collection('networks')
        networks_collection.update_one({
                                        '_id': mergedNetwork_object_id,
                                        },
                                        {
                                        '$set': {
                                            "communities": mergedNetwork.communities,
                                            "retweetCommunities": mergedNetwork.retweetCommunities,
                                            "quoteCommunities": mergedNetwork.quoteCommunities,
                                        }
                                    })
    except:
        print('Error updating communities')

    # asyncio.run(mongo_utils.network_layout(mergedNetwork_object_id))
    mongo.update_project_status(project_id, constants.project_ready)
