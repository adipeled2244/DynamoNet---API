import tweepy
import json
import datetime
import pytz

# set up classes to save data
class User:
    def __init__(self, id, name, screen_name, location, description, followers_count, friends_count, statuses_count, created_at):
        self.id = id
        self.name = name
        self.screen_name = screen_name
        self.location = location
        self.description = description
        self.followers_count = followers_count
        self.friends_count = friends_count
        self.statuses_count = statuses_count
        self.created_at = created_at

    def __str__(self):
        return f'{self.id}'
            
class Tweet:
    def __init__(self, id, text, created_at, user):
        self.id = id
        self.text = text
        self.created_at = created_at
        self.user = user

    def __str__(self):
        return f'Text: {self.text}'

class Network:
    def __init__(self, networkType, _id=None):
        self.networkType = networkType
        self.nodes = None
        self.edges = []
        self.numberOfNodes = None
        self.numberOfEdges = None
        self.density = None
        self.diameter = None
        self.radius =None
        self.reciprocity = None
        self.degreeCentrality = None
        self.nodeMetrics = {}
        self._id = _id

class Edge:
    def __init__(self, source, destination, timestamp, edgeContent, _id=None):
        self.source = source
        self.destination = destination
        self.timestamp = timestamp
        self.edgeContent = edgeContent
        self._id = _id

class Project:
    def __init__(self, title, description, dataset, startDate, endDate, edgeType, timeRanges, networks, favoriteNodes):
        self.createdDate = datetime.datetime.now(pytz.utc)
        self.title = title
        self.description = description
        self.dataset = dataset
        self.startDate = startDate
        self.endDate = endDate
        self.edgeType = edgeType
        self.timeRanges = timeRanges
        self.networks = networks
        self.favoriteNodes = favoriteNodes

class TimeRange:
    def __init__(self, startDate, endDate, network):
        self.startDate = startDate
        self.endDate = endDate
        self.network = network

# Tweepy Wrapper
class TweepyWrapper:
    def __init__(self, bearer_token, consumer_key, consumer_secret, access_token, access_token_secret):
        self.auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
        self.auth.set_access_token(access_token, access_token_secret)
        self.api = tweepy.API(self.auth, wait_on_rate_limit=True)
        self.client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)
        self.bearer_token = bearer_token

    def get_users(self, screen_names):
        return self.api.lookup_users(screen_name=screen_names)

    def get_users_by_id(self, user_ids):
        return self.api.lookup_users(user_id=user_ids)

    def get_user(self, screen_name):
        return self.api.get_user(screen_name=screen_name)

    def get_followers(self, screen_name):
        return self.api.followers(screen_name)

    def get_friends(self, screen_name):
        return self.api.friends(screen_name)

    def get_user_timeline(self, screen_name):
        return self.api.user_timeline(screen_name)

    def get_retweets(self, tweet_id):
        return self.api.get_retweets(id=tweet_id)
        
    # TODO: fix this function -- API call with since and until is not working
    def get_mentions(self, user_id, start_date, end_date, limit=None):
        # conver datetime to twitter datetime format
        start_date = start_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        end_date = end_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        mentionsList = []
        last_id = None
        while True:
            mentions = self.api.search_tweets(q=f'@{user_id}', count=100, max_id=last_id, tweet_mode='extended',  since=start_date, until=end_date)
            if len(mentions) == 0:
                break
            last_id = mentions[-1].id
            mentionsList.extend(mentions)
            if limit is not None and len(mentionsList) >= limit:
                break
        return mentionsList

    def get_quote_tweets(self, tweet_id, start_date, end_date, limit=None):
        # convert naive datetime to UTC
        start_date = start_date.replace(tzinfo=pytz.UTC)
        end_date = end_date.replace(tzinfo=pytz.UTC)
        quotesList = []
        quotes = self.client.get_quote_tweets(id=tweet_id, expansions='author_id', tweet_fields='created_at', max_results=100)
        if quotes.data is not None:
            quotesList.extend(quotes.data)
        while 'next_token' in quotes.meta:
            if limit is not None and len(quotesList) >= limit:
                break
            quotes = self.client.get_quote_tweets(id=tweet_id, expansions='author_id', tweet_fields='created_at', max_results=100, pagination_token=quotes.meta['next_token'])
            if quotes.data is not None:
                quotesList.extend(quotes.data)
        # check if created_at exists if not get_status and check if created_at is within the date range specified
        quotesList = [quote if hasattr(quote, 'created_at') else self.get_status(quote.id) for quote in quotesList if quote.created_at >= start_date and quote.created_at <= end_date]
        return quotesList
        
    def get_status(self, tweet_id):
        return self.api.get_status(tweet_id)
    
    def get_user_tweets(self, screen_name, start_date, end_date, limit=None):
        # convert naive datetime to UTC
        start_date = start_date.replace(tzinfo=pytz.UTC)
        end_date = end_date.replace(tzinfo=pytz.UTC)
        tweets = []
        for tweet in tweepy.Cursor(self.api.user_timeline, screen_name=screen_name).items():
            if tweet.created_at >= start_date and tweet.created_at <= end_date:
                tweets.append(tweet)
            if limit is not None and len(tweets) >= limit:
                break
        return tweets

# Parse user data into a list of users
def parseUserData(data):
    users = {}
    for user in data:
        users[user['id']] = User(user['id'], user['name'], user['screen_name'], user['location'], user['description'], user['followers_count'], user['friends_count'], user['statuses_count'], user['created_at'])
    return users

# Parse tweet data into a list of tweets
def parseTweetData(data):
    tweets = []
    for tweet in data:
        tweets.append(Tweet(tweet['id'], tweet['text'], tweet['created_at'], tweet['user']))
    return tweets

# Replace user ids with user objects
def replaceUserIdsWithUserObjects(tweets):
    for tweet in tweets:
        tweet.user = User(tweet.user['id'], tweet.user['name'], tweet.user['screen_name'], tweet.user['location'], tweet.user['description'], tweet.user['followers_count'], tweet.user['friends_count'], tweet.user['statuses_count'], tweet.user['created_at'])
    return tweets

# Parse network data into a network
def parseNetworkData(data):
    network = Network('Directed')
    for edge in data:
        network.edges.append(Edge(int(edge['source']), int(edge['destination']), edge['timestamp'], edge['edgeContent']))
        network.nodes[int(edge['source'])] = User(int(edge['source']), '', '', '', '', 0, 0, 0, '')
        network.nodes[int(edge['destination'])] = User(int(edge['destination']), '', '', '', '', 0, 0, 0, '')
    return network

# Replace network source and destination ids with user objects
def replaceNetworkIdsWithUserObjects(network, users):
    for edge in network.edges:
        edge.source = users[edge.source]
        edge.destination = users[edge.destination]
    return network

# insert time ranges into a project
def insertTimeRanges(project, timeRanges):
    if project.timeRanges is None:
        project.timeRanges = []
    for timeRange in timeRanges:
        project.timeRanges.append(timeRange)
    return project

# insert networks into a project
def insertNetworks(project, networks):
    if project.networks is None:
        project.networks = []
    for network in networks:
        project.networks.append(network)
    return project
