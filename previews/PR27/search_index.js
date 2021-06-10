var documenterSearchIndex = {"docs":
[{"location":"interface/","page":"Interface","title":"Interface","text":"CurrentModule = NetworkLayout","category":"page"},{"location":"interface/#Layout-Interface","page":"Interface","title":"Layout Interface","text":"","category":"section"},{"location":"interface/","page":"Interface","title":"Interface","text":"At its core, each layout algorithm is a mapping ","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"adj_matrix ↦ node_positions","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"where each algorithm has several parameters. The main goal of the following interface is to keep the separation between parameters and function call.  Each Algorithm is implemented as subtype of AbstractLayout.","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"AbstractLayout","category":"page"},{"location":"interface/#NetworkLayout.AbstractLayout","page":"Interface","title":"NetworkLayout.AbstractLayout","text":"AbstractLayout{Dim,Ptype}\n\nAbstract supertype for all layouts. Each layout Layout <: AbstractLayout needs to implement\n\nlayout(::Layout, adj_matrix)::Vector{Point{Dim,Ptype}}\n\nwhich takes the adjacency matrix representation of a network and returns a list of node positions. Each Layout object holds all of the necessary parameters.\n\nBy implementing layout the Layout also inherits the function-like property\n\nLayout(; kwargs...)(adj_matrix) -> node_positions\n\n\n\n\n\n","category":"type"},{"location":"interface/","page":"Interface","title":"Interface","text":"Therefore, each Algorithm <: AbstractLayout is a functor and can be passed around as a function adj_matrix ↦ node_positions which encapsulates all the parameters. This is handy for plotting libraries such as GraphMakie.jl.","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"There are some additional guidelines:","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"All of the parameters should be keyword arguments, i.e. it should be allways possible to call Algorithm() without specifying any parameters.\nAlgorithms should allways return Vector{Point{dim,Ptype}}. If the type or dimensions can be altered use the keywords dim and Ptype for it.\nSome parameters may depend on the specific network (i.e. length of start positions vector). If possible, there should be a fallback option (i.e. truncate the list of start positions if network is to small or append with random values).","category":"page"},{"location":"interface/#Iterative-Layouts","page":"Interface","title":"Iterative Layouts","text":"","category":"section"},{"location":"interface/","page":"Interface","title":"Interface","text":"Iterative layouts are a specific type of layouts which produce a sequence of positions rather than a single list of positions. Those algorithms are implemented as subtypes of IterativeLayout:","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"IterativeLayout","category":"page"},{"location":"interface/#NetworkLayout.IterativeLayout","page":"Interface","title":"NetworkLayout.IterativeLayout","text":"IterativeLayout{Dim,Ptype} <: AbstractLayout{Dim,Ptype}\n\nAbstract supertype for iterative layouts. Instead of implementing layout directly, subtypes Algorithm<:IterativeLayout need to implement the iterator interface\n\nBase.iterate(iter::LayoutIterator{<:Algorithm})\nBase.iterate(iter::LayoutIterator{<:Algorithm}, state)\n\nwhere the iteration item is a Vector{Point{Dim,Ptype}} and the iteration state depends on the algorithm.\n\nBy implementing the iterator interface the Algorithm inherits the layout and function-like call\n\nlayout(algo::Algorithm, adj_matrix) -> node_postions\nAlgorithm(; kwargs...)(adj_matrix) -> node_positions\n\n\n\n\n\n","category":"type"},{"location":"interface/","page":"Interface","title":"Interface","text":"One can instantiate an iterable object LayoutIterator","category":"page"},{"location":"interface/","page":"Interface","title":"Interface","text":"LayoutIterator","category":"page"},{"location":"interface/#NetworkLayout.LayoutIterator","page":"Interface","title":"NetworkLayout.LayoutIterator","text":"LayoutIterator{T<:IterativeLayout,M<:AbstractMatrix}(algorithm, adj_matrix)\n\nThis type bundles an IterativeLayout with an adjacency matrix to form an iterable object whose items are the node positions.\n\nExample\n\nfor p in LayoutIterator(Stress(), adj_matrix)\n    # do stuff with positions p\nend\n\n\n\n\n\n","category":"type"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = NetworkLayout","category":"page"},{"location":"#NetworkLayout","page":"Home","title":"NetworkLayout","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This is the Documentation for NetworkLayout.","category":"page"},{"location":"","page":"Home","title":"Home","text":"All example images on this page are created using Makie.jl and the graphplot recipe from GraphMakie.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"using CairoMakie\nCairoMakie.activate!(type=\"png\") # hide\nset_theme!(resolution=(800, 400)) #hide\nCairoMakie.inline!(true) # hide\nusing NetworkLayout\nusing GraphMakie, LightGraphs\nnothing #hide","category":"page"},{"location":"#Basic-Usage-and-Algorithms","page":"Home","title":"Basic Usage & Algorithms","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"All of the algorithms follow the Layout Interface. Each layout algorithm is represented by a type Algorithm <: AbstractLayout. The parameters of each algorithm can be set with keyword arguments. The Algorithm object itself is callable and transforms the adjacency matrix and returns a list of Point{N,T} from GeometryBasics.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"alg = Algorithm(; p1=\"foo\", p2=:bar)\npositions = alg(adj_matrix)","category":"page"},{"location":"#Scalable-Force-Directed-Placement","page":"Home","title":"Scalable Force Directed Placement","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SFDP","category":"page"},{"location":"#NetworkLayout.SFDP","page":"Home","title":"NetworkLayout.SFDP","text":"SFDP(; kwargs...)(adj_matrix)\nlayout(algo::SFDP, adj_matrix)\n\nUsing the Spring-Electric model suggested by Yifan Hu. Forces are calculated as:\n\n    f_attr(i,j) = ‖xi - xj‖ ² / K ,    i<->j\n    f_repln(i,j) = -CK² / ‖xi - xj‖ ,  i!=j\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\ndim=2, Ptype=Float64: Determines dimension and output type Point{dim,Ptype}.\ntol=1.0: Stop if position changes of last step Δp <= tol*K for all nodes\nC=0.2, K=1.0: Parameters to tweak forces.\niterations=100: maximum number of iterations\ninitialpos=Point{dim,Ptype}[]\nProvide list of initial positions. If length does not match Network size the initial positions will be truncated or filled up with random values between [-1,1] in every coordinate.\nseed=1: Seed for random initial positions.\n\n\n\n\n\n","category":"type"},{"location":"#Example","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"g = wheel_graph(10)\nlayout = SFDP(tol=0.01, C=0.2, K=1)\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f","category":"page"},{"location":"#Iterator-Example","page":"Home","title":"Iterator Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"iterator = LayoutIterator(layout, adjacency_matrix(g))\nrecord(f, \"sfdp_animation.mp4\", iterator; framerate = 10) do pos\n    p[:node_positions][] = pos\n    autolimits!(ax)\nend\nnothing #hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: sfdp animation)","category":"page"},{"location":"#Buchheim-Tree-Drawing","page":"Home","title":"Buchheim Tree Drawing","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Buchheim","category":"page"},{"location":"#NetworkLayout.Buchheim","page":"Home","title":"NetworkLayout.Buchheim","text":"Buchheim(; kwargs...)(adj_matrix)\nBuchheim(; kwargs...)(adj_list)\nlayout(algo::Buchheim, adj_matrix)\nlayout(algo::Buchheim, adj_list)\n\nUsing the algorithm proposed in the paper, \"Improving Walker's Algorithm to Run in Linear Time\" by Christoph Buchheim, Michael Junger, Sebastian Leipert\n\nTakes adjacency matrix or list representation of given tree and returns coordinates of the nodes.\n\nKeyword Arguments\n\nPtype=Float64: Determines the output type Point{2,Ptype}.\nnodesize=Float64[]\nDetermines the size of each of the node. If network size does not match the length of nodesize fill up with ones or truncate given parameter.\n\n\n\n\n\n","category":"type"},{"location":"#Example-2","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"adj_matrix = [0 1 1 0 0 0 0 0 0 0;\n              0 0 0 0 1 1 0 0 0 0;\n              0 0 0 1 0 0 1 0 1 0;\n              0 0 0 0 0 0 0 0 0 0;\n              0 0 0 0 0 0 0 1 0 1;\n              0 0 0 0 0 0 0 0 0 0;\n              0 0 0 0 0 0 0 0 0 0;\n              0 0 0 0 0 0 0 0 0 0;\n              0 0 0 0 0 0 0 0 0 0;\n              0 0 0 0 0 0 0 0 0 0]\ng = SimpleDiGraph(adj_matrix)\nlayout = Buchheim()\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#Spring/Repulsion-Model","page":"Home","title":"Spring/Repulsion Model","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Spring","category":"page"},{"location":"#NetworkLayout.Spring","page":"Home","title":"NetworkLayout.Spring","text":"Spring(; kwargs...)(adj_matrix)\nlayout(algo::Spring, adj_matrix)\n\nUse the spring/repulsion model of Fruchterman and Reingold (1991) with\n\nAttractive force:  f_a(d) =  d^2 / k\nRepulsive force:  f_r(d) = -k^2 / d\n\nwhere d is distance between two vertices and the optimal distance between vertices k is defined as C * sqrt( area / num_vertices ) where C is a parameter we can adjust\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\ndim=2, Ptype=Float64: Determines dimension and output type Point{dim,Ptype}.\nC=2.0: Constant to fiddle with density of resulting layout\niterations=100: maximum number of iterations\ninitialtemp=2.0: Initial \"temperature\", controls movement per iteration\ninitialpos=Point{dim,Ptype}[]\nProvide list of initial positions. If length does not match Network size the initial positions will be truncated or filled up with random values between [-1,1] in every coordinate.\nseed=1: Seed for random initial positions.\n\n\n\n\n\n","category":"type"},{"location":"#Example-3","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"g = smallgraph(:cubical)\nlayout = Spring()\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#Iterator-Example-2","page":"Home","title":"Iterator Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"iterator = LayoutIterator(layout, adjacency_matrix(g))\nrecord(f, \"spring_animation.mp4\", iterator; framerate = 10) do pos\n    p[:node_positions][] = pos\n    autolimits!(ax)\nend\nnothing #hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: spring animation)","category":"page"},{"location":"#Stress-Majorization","page":"Home","title":"Stress Majorization","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Stress","category":"page"},{"location":"#NetworkLayout.Stress","page":"Home","title":"NetworkLayout.Stress","text":"Stress(; kwargs...)(adj_matrix)\nlayout(algo::Stress, adj_matrix)\n\nCompute graph layout using stress majorization. Takes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nInputs:\n\nadj_matrix: Matrix of pairwise distances.\n\nKeyword Arguments\n\ndim=2, Ptype=Float64: Determines dimension and output type Point{dim,Ptype}.\niterations=:auto: maximum number of iterations (:auto means 400*N^2 where N are the number of vertices)\nabstols=(√(eps(Float64)))\nAbsolute tolerance for convergence of stress. The iterations terminate if the  difference between two successive stresses is less than abstol.\nreltols=(√(eps(Float64)))\nRelative tolerance for convergence of stress. The iterations terminate if the difference between two successive stresses relative to the current stress is less than reltol.\nabstolx=(√(eps(Float64)))\nAbsolute tolerance for convergence of layout. The iterations terminate if the Frobenius norm of two successive layouts is less than abstolx.\nweights=Array{Float64}(undef, 0, 0)\nMatrix of weights. If empty (i.e. not specified), defaults to weights[i,j] = δ[i,j]^-2 if δ[i,j] is nonzero, or 0 otherwise.\ninitialpos=Point{dim,Ptype}[]\nProvide list of initial positions. If length does not match Network size the initial positions will be truncated or filled up with random normal distributed values in every coordinate.\nseed=1: Seed for random initial positions.\n\nReference:\n\nThe main equation to solve is (8) of:\n\n@incollection{\n    author = {Emden R Gansner and Yehuda Koren and Stephen North},\n    title = {Graph Drawing by Stress Majorization}\n    year={2005},\n    isbn={978-3-540-24528-5},\n    booktitle={Graph Drawing},\n    seriesvolume={3383},\n    series={Lecture Notes in Computer Science},\n    editor={Pach, J'anos},\n    doi={10.1007/978-3-540-31843-9_25},\n    publisher={Springer Berlin Heidelberg},\n    pages={239--250},\n}\n\n\n\n\n\n","category":"type"},{"location":"#Example-4","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"g = complete_graph(10)\nlayout = Stress()\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#Iterator-Example-3","page":"Home","title":"Iterator Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"iterator = LayoutIterator(layout, adjacency_matrix(g))\nrecord(f, \"stress_animation.mp4\", iterator; framerate = 10) do pos\n    p[:node_positions][] = pos\n    autolimits!(ax)\nend\nnothing #hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: stress animation)","category":"page"},{"location":"#Circular-Layout","page":"Home","title":"Circular Layout","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Circular","category":"page"},{"location":"#NetworkLayout.Circular","page":"Home","title":"NetworkLayout.Circular","text":"Circular(; kwargs...)(adj_matrix)\nlayout(algo::Circular, adj_matrix)\n\nPosition nodes on a circle with radius 1.\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\nPtype=Float64: Determines the output type Point{2,Ptype}.\n\n\n\n\n\n","category":"type"},{"location":"","page":"Home","title":"Home","text":"g = smallgraph(:karate)\nlayout = Circular()\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#Shell-Layout","page":"Home","title":"Shell Layout","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Shell","category":"page"},{"location":"#NetworkLayout.Shell","page":"Home","title":"NetworkLayout.Shell","text":"Shell(; kwargs...)(adj_matrix)\nlayout(algo::Shell, adj_matrix)\n\nPosition nodes in conenctric circles.\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\nPtype=Float64: Determines the output type Point{2,Ptype}.\nnlist=Vector{Int}[]\nList of node-lists for each shell from inner to outer. Tells the algorithm which node idx to place on which circle. Nodes which are not present in this list will be place on additional outermost shell.\n\nThis function started as a copy from IainNZ's GraphLayout.jl\n\n\n\n\n\n","category":"type"},{"location":"","page":"Home","title":"Home","text":"g = smallgraph(:petersen)\nlayout = Shell(nlist=[6:10,])\nf, ax, p = graphplot(g, layout=layout)\nhidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#SquareGrid-Layout","page":"Home","title":"SquareGrid Layout","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SquareGrid","category":"page"},{"location":"#NetworkLayout.SquareGrid","page":"Home","title":"NetworkLayout.SquareGrid","text":"SquareGrid(; kwargs...)(adj_matrix)\nlayout(algo::SquareGrid, adj_matrix)\n\nPosition nodes on a 2 dimensional rectagular grid. The nodes are palced in order from upper left to lower right. To skip positions see skip argument.\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\nPtype=Float64: Determines the output type Point{2,Ptype}\ncols=:auto: Columns of the grid, the rows are determined automatic. If :auto the layout will be square-ish.\ndx=Ptype(1), dy=Ptype(-1): Ofsets between rows/cols.\nskip=Tuple{Int,Int}[]: Specify positions to skip when placing nodes. skip=[(i,j)] means to keep the position in the i-th row and j-th column empty.\n\n\n\n\n\n","category":"type"},{"location":"","page":"Home","title":"Home","text":"g = Grid((12,4))\nlayout = SquareGrid(cols=12)\nf, ax, p = graphplot(g, layout=layout, nlabels=repr.(1:nv(g)), nlabels_textsize=10, nlabels_distance=5)\nylims!(-4.5,.5); hidedecorations!(ax); hidespines!(ax); ax.aspect = DataAspect(); f #hide","category":"page"},{"location":"#Spectral","page":"Home","title":"Spectral","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Spectral","category":"page"},{"location":"#NetworkLayout.Spectral","page":"Home","title":"NetworkLayout.Spectral","text":"Spectral(; kwargs...)(adj_matrix)\nlayout(algo::Spectral, adj_matrix)\n\nThis algorithm uses the technique of Spectral Graph Drawing, which is an under-appreciated method of graph layouts; easier, simpler, and faster than the more common spring-based methods. For reference see\n\nhttp://www.research.att.com/export/sites/att_labs/groups/infovis/res/legacy_papers/DBLP-journals-camwa-Koren05.pdf\nhttp://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.3.2055&rep=rep1&type=pdf\n\nTakes adjacency matrix representation of a network and returns coordinates of the nodes.\n\nKeyword Arguments\n\nPtype=Float64: Determines the output type Point{3,Ptype}.\nnodeweights=Float64[]\nVector of weights. If network size does not match the length of nodesize use ones instead.\n\n\n\n\n\n","category":"type"},{"location":"","page":"Home","title":"Home","text":"set_theme!(resolution=(800, 800)) #hide\nusing Random; Random.seed!(5) # hide\ng = watts_strogatz(30, 5, 1)\nlayout = Spectral()\nf, ax, p = graphplot(g, layout=layout, node_size=5, edge_width=1)\nf #hide","category":"page"}]
}