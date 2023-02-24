import igraph as ig
import numpy as np

from class_utils import Project, Network, Edge, User

# Get nodes for edges in the network
def getNodes(network):
    nodes = set()
    for edge in network.edges:
        nodes.add(edge.source)
        nodes.add(edge.destination)
    return nodes

# Create a graph from the network
def createGraph(network):
    graph = ig.Graph(directed=True)
    if network.nodes is None:
        network.nodes = getNodes(network)
    graph.add_vertices([str(node) for node in network.nodes])
    graph.add_edges([(str(edge.source), str(edge.destination)) for edge in network.edges])
    return graph

## Network metrics
# Calculate the number of nodes in the graph
def numberOfNodes(graph):
    return graph.vcount()

# Calculate the number of edges in the graph
def numberOfEdges(graph):
    return graph.ecount()
    
# Calculate the density of the graph
def density(graph):
    return graph.density()

# Calculate the diameter of the graph
def diameter(graph):
    return graph.diameter()

# Calculate the radius of the graph
def radius(graph):
    return graph.radius()

# Calculate the reciprocity of the graph
def reciprocity(graph):
    return graph.reciprocity()

# calculate the degree centrality of the graph using Freeman's formula
def freemanDegreeCentrality(graph):
    degrees = graph.degree()
    if len(degrees) == 0 or graph.vcount() <= 2:
        return np.NAN
    max_degree = max(degrees)
    degree_distances = [max_degree - degree for degree in degrees]
    return sum(degree_distances) / ((graph.vcount() - 1) * (graph.vcount() - 2))

## Node metrics
# Calculate the degree of a node
def degree(graph, node):
    return graph.vs.find(name=str(node)).degree()
    # return graph.degree(node_id)

# Calculate the in-degree of a node
def inDegree(graph, node):
    return graph.vs.find(name=str(node)).indegree()
    # return graph.strength(node, mode=ig.IN)

# Calculate the out-degree of a node
def outDegree(graph, node):
    return graph.vs.find(name=str(node)).outdegree()
    # return graph.strength(node, mode=ig.OUT)

# Calculate the closeness centrality of a node
def closenessCentrality(graph, node):
    return graph.vs.find(name=str(node)).closeness()
    # return graph.closeness(node)

# Calculate the betweenness centrality of a node
def betweennessCentrality(graph, node):
    # return graph.betweenness(node)
    return graph.vs.find(name=str(node)).betweenness()

# Calculate the local clustering coefficient of a node
def localClusteringCoefficient(graph, node):
    # return graph.transitivity_local_undirected(node)
    # return graph.vs.find(name=str(node)).transitivity_local_undirected()
    node_id = graph.vs.find(name=str(node)).index
    return graph.transitivity_local_undirected(node_id)

# Calculate all network metrics for a network
def calculateNetworkMetrics(network):
    graph = createGraph(network)
    network.numberOfNodes = numberOfNodes(graph)
    network.numberOfEdges = numberOfEdges(graph)
    network.density = float(density(graph))
    network.diameter = float(diameter(graph))
    network.radius = float(radius(graph))
    network.reciprocity = float(reciprocity(graph))
    network.degreeCentrality = float(freemanDegreeCentrality(graph))

def calculateNodeMetrics(network, node):
    graph = createGraph(network)
    if node not in network.nodes:
        return None
    node_metrics = {
        'degree': degree(graph, node),
        'inDegree': inDegree(graph, node),
        'outDegree': outDegree(graph, node),
        'closenessCentrality': closenessCentrality(graph, node),
        'betweennessCentrality': betweennessCentrality(graph, node),
        'localClusteringCoefficient': localClusteringCoefficient(graph, node)

    }
    return node_metrics