# required packages:
# pip install tweepy
# pip install pytz
# pip install pymongo


from config import bearer_token, consumer_key, consumer_secret, access_token, access_token_secret
from config import mongo_host

from class_utils import Project, TimeRange, Network, User, Edge, TweepyWrapper, Tweet
import mongo_utils
from mongo_utils import MongoWrapper

def get_users(tweepyWrapper, screen_names):
    users = []
    # get users in batches of 100
    for i in range(0, len(screen_names), 100):
        try:
            users.extend(tweepyWrapper.get_users(screen_names[i:i+100]))
        except:
            pass

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

def get_tweets(tweepyWrapper, users, start_date, end_date, limit=None):
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


def get_retweets_network(tweepyWrapper, tweets):
    retweetNetwork = Network('retweet')
    for tweet in tweets:
        retweets = tweepyWrapper.get_retweets(tweet.id)
        for retweet in retweets:
            retweetNetwork.edges.append(
                Edge(
                    source=retweet.user.id,
                    destination=tweet.user,
                    timestamp=retweet.created_at,
                    edgeContent=tweet.text
                )
            )
    return retweetNetwork

def get_quotes_network(tweepyWrapper, tweets, start_date, end_date, limit=None):
    quoteNetwork = Network('quote')
    for tweet in tweets:
        quotes = tweepyWrapper.get_quote_tweets(tweet.id, start_date, end_date, limit=limit)
        for quote in quotes:
            quoteNetwork.edges.append(
                Edge(
                    source=quote.author_id,
                    destination=tweet.user,
                    timestamp=quote.created_at,
                    edgeContent=tweet.text
                )
            )
    return quoteNetwork

def get_user_ids_from_network_source_nodes(network, exclude_users=None):
    if exclude_users is None:
        exclude_users = []
    sourceUsers = []
    for edge in network.edges:
        if edge.source not in sourceUsers and edge.source not in exclude_users:
            sourceUsers.append(edge.source)

    return sourceUsers

def get_users_by_id_as_dict(tweepyWrapper, user_ids):
    users = []
    # get users in batches of 100
    for i in range(0, len(user_ids), 100):
        try:
            users.extend(tweepyWrapper.get_users_by_id(user_ids[i:i+100]))
        except:
            pass

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

def replace_source_ids_with_users(network, user_dict):
    for edge in network.edges:
        try:
            edge.source = user_dict[edge.source]
        except:
            network.edges.remove(edge)

def import_data(project_id, limit=None, db_name='test'):
    project = mongo_utils.get_project(project_id, mongo_host=mongo_host, db_name=db_name)
    if project is None:
        print('Project not found')
        return

    dataset = project['dataset']
    startDate = project['startDate']
    endDate = project['endDate']

    # set up tweepy wrapper
    tweepyWrapper = TweepyWrapper(bearer_token, consumer_key, consumer_secret, access_token, access_token_secret)

    # get initial users
    initial_users = get_users(tweepyWrapper, dataset)
    print('Initial users len: ', len(initial_users))

    # get initial users' tweets
    tweetList = get_tweets(tweepyWrapper, initial_users, startDate, endDate, limit=limit)
    print('Tweet list len: ', len(tweetList))
    if len(tweetList) == 0:
        print('No tweets found')
        return
    # build retweet network
    retweetNetwork = get_retweets_network(tweepyWrapper, tweetList)
    print('Retweet network len: ', len(retweetNetwork.edges))

    # get source users from retweet network
    sourceUsers = get_user_ids_from_network_source_nodes(retweetNetwork)
    print('Source users len: ', len(sourceUsers))

    # get users by id
    source_users_dict = get_users_by_id_as_dict(tweepyWrapper, sourceUsers)
    print('Source users dict len: ', len(source_users_dict))

    # replace source ids with user objects
    replace_source_ids_with_users(retweetNetwork, source_users_dict)

    # save initial_users to mongo
    mongo_utils.save_users(initial_users, mongo_host=mongo_host, db_name=db_name)
    
    # save source_users_dict to mongo
    mongo_utils.save_users(list(source_users_dict.values()), mongo_host=mongo_host, db_name=db_name)

    # save retweetNetwork to mongo
    retweetNetwork_object_id = mongo_utils.save_network(retweetNetwork, mongo_host=mongo_host, db_name=db_name)

    # insert network id into project
    mongo_utils.insert_network_to_project(project_id, retweetNetwork_object_id, mongo_host=mongo_host, db_name=db_name)

    # build quote network
    quoteNetwork = get_quotes_network(tweepyWrapper, tweetList, startDate, endDate)

    # get source users from quote network
    missing_source_users = get_user_ids_from_network_source_nodes(quoteNetwork, exclude_users=sourceUsers)

    # get missing users by id
    missing_source_users_dict = get_users_by_id_as_dict(tweepyWrapper, missing_source_users)

    # updated source_users_dict
    source_users_dict.update(missing_source_users_dict)

    # replace source ids with user objects
    replace_source_ids_with_users(quoteNetwork, source_users_dict)

    # save missing_source_users_dict to mongo
    mongo_utils.save_users(list(missing_source_users_dict.values()), mongo_host=mongo_host, db_name=db_name)

    # save quoteNetwork to mongo
    quoteNetwork_object_id = mongo_utils.save_network(quoteNetwork, mongo_host=mongo_host, db_name=db_name)

    # insert network id into project
    mongo_utils.insert_network_to_project(project_id, quoteNetwork_object_id, mongo_host=mongo_host, db_name=db_name)
