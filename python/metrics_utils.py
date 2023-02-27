import igraph as ig
import numpy as np

from class_utils import Project, Network, Edge, User

# Get nodes for edges in the network
def getNodes(network) -> set:
    nodes = set()
    for edge in network.edges:
        nodes.add(edge.source)
        nodes.add(edge.destination)
    return nodes

# Create a graph from the network
def createGraph(network) -> ig.Graph:
    graph = ig.Graph(directed=False)
    if network.nodes is None or len(network.nodes) == 0:
        network.nodes = getNodes(network)
    graph.add_vertices([str(node) for node in network.nodes])
    graph.add_edges([(str(edge.source), str(edge.destination)) for edge in network.edges])
    return graph

## Network metrics
# Calculate the number of nodes in the graph
def numberOfNodes(graph) -> int:
    return graph.vcount()

# Calculate the number of edges in the graph
def numberOfEdges(graph) -> int:
    return graph.ecount()
    
# Calculate the density of the graph
def density(graph) -> float:
    return graph.density()

# Calculate the diameter of the graph
def diameter(graph) -> int:
    return graph.diameter()

# Calculate the radius of the graph
def radius(graph) -> int:
    return graph.radius()

# Calculate the reciprocity of the graph
def reciprocity(graph) -> float:
    return graph.reciprocity()

# calculate the degree centrality of the graph using Freeman's formula
def freemanDegreeCentrality(graph) -> float:
    degrees = graph.degree()
    if len(degrees) == 0 or graph.vcount() <= 2:
        return np.NAN
    max_degree = max(degrees)
    degree_distances = [max_degree - degree for degree in degrees]
    return sum(degree_distances) / ((graph.vcount() - 1) * (graph.vcount() - 2))

## Node metrics
# Calculate the degree of a node
def degree(graph, node) -> int:
    return graph.vs.find(name=str(node)).degree()
    # return graph.degree(node_id)

# Calculate the in-degree of a node
def inDegree(graph, node) -> int:
    return graph.vs.find(name=str(node)).indegree()
    # return graph.strength(node, mode=ig.IN)

# Calculate the out-degree of a node
def outDegree(graph, node) -> int:
    return graph.vs.find(name=str(node)).outdegree()
    # return graph.strength(node, mode=ig.OUT)

# Calculate the closeness centrality of a node
def closenessCentrality(graph, node) -> float:
    return graph.vs.find(name=str(node)).closeness()
    # return graph.closeness(node)

# Calculate the betweenness centrality of a node
def betweennessCentrality(graph, node) -> float:
    # return graph.betweenness(node)
    return graph.vs.find(name=str(node)).betweenness()

# Calculate the local clustering coefficient of a node
def localClusteringCoefficient(graph, node) -> float:
    # return graph.transitivity_local_undirected(node)
    # return graph.vs.find(name=str(node)).transitivity_local_undirected()
    node_id = graph.vs.find(name=str(node)).index
    return graph.transitivity_local_undirected(node_id)

## Calculate metrics for a network
def calculateNetworkMetrics(network) -> dict:
    graph = createGraph(network)
    networkMetrics = {
        "numberOfNodes" : numberOfNodes(graph),
        "numberOfEdges" : numberOfEdges(graph),
        "density" : float(density(graph)),
        "diameter" : float(diameter(graph)),
        "radius" : float(radius(graph)),
        "reciprocity" : float(reciprocity(graph)),
        "degreeCentrality" : float(freemanDegreeCentrality(graph))
    }
    return networkMetrics

## Calculate metrics for a node
def calculateNodeMetrics(network, node) -> dict:
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