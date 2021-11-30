def traveling_salesperson():
    return """
start(a).
city(a). city(b). city(c). city(d).
road(a,b,10). road(b,c,20). road(c,d,25). road(d,a,40). road(b,d,30). road(d,c,25). road(c,a,35).
road(c,b, 25). road(b,c,25). road(a,c,10).


{ travel(X,Y) } :- road(X,Y,_).
visited(Y) :- travel(X,Y), start(X). visited(Y) :- travel(X,Y), visited(X).
:- city(X), not visited(X).
:- city(X), 2 { travel(X,Y) }. :- city(X), 2 { travel(Y,X) }.

#minimize { D,X,Y : travel(X,Y), road(X,Y,D) }.
"""


def traveling_salesperson_without_minimize():
    return "\n".join(traveling_salesperson().split("\n")[:-1])


def traveling_salesperson_without_minimize_and_constraints():
    return "\n".join(traveling_salesperson_without_minimize().split("\n")[:-3])
