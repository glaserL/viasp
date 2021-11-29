% INSERT NAMES AND EMAIL ADDRESSES OF YOUR GROUP MEMBERS:
% Luis Glaser, Luis.Glaser@uni-potsdam.de
%

dir(0,1). dir(0,-1). dir(1,0). dir(-1,0).

% HINTS:
% - You may use the gaps of adjacent cells' coordinates to denote directions.
% - Develop your encoding incrementally and check the additions. If in doubt
%   whether rules are correct, the "--text" option of gringo/clingo allows
%   for investigating the instantiation, while small instances are advisable.

% Your implementation please...

%:- dir(0,Y).
%:- dir(X,0).

% Copy pasted input format as a reminder:
% cell(1,1).    cell(1,2). ...  cell(5,4).  cell(5,5).  number(1,5,5).
% area(1,1,1).  area(2,1,1).                goal(1,6).  number(3,1,1).

% We first define all movement rules.
% s = source, t = target, tr = trace
{target(Xs,Ys,Xt,Yt)} :- number(Xs, Ys, _), area(Xt, Yt, _). % move the numbers to an area.
% Now remove forbidden movements to keep set of traces small
:- target(Xs,Ys,Xt,Yt), Xs != Xt, Ys != Yt. %only move in one direction
% Remove duplicate moves both source and target
:- target(Xs,Ys,Xt,Yt), target(Xs,Ys,Xt',Yt'), Xt != Xt'.
:- target(Xs,Ys,Xt,Yt), target(Xs,Ys,Xt',Yt'), Yt != Yt'.
:- target(Xs,Ys,Xt,Yt), target(Xs',Ys',Xt,Yt), Xs != Xs'.
:- target(Xs,Ys,Xt,Yt), target(Xs',Ys',Xt,Yt), Ys != Ys'.


% now to the goal rules.
% Ensure each number gets moved.
:- A = #count{(Xs,Ys) : target(Xs,Ys,_,_)},B= #count{(Xt,Yt):number(Xt,Yt,_)}, A != B.

% Ensure that we meet each goal criteria of an area
fieldSum(ID, S) :- goal(ID, _), S = #sum{ VAL : number(Xs,Ys,VAL), target(Xs,Ys,Xt,Yt), area(Xt,Yt,ID),goal(ID,G) }. % this and below seems to be doubling stuff?
:- target(_,_,Xt,Yt), area(Xt,Yt,ID), fieldSum(ID, S), goal(ID,G), S != G.

% Ensure each field is filled
:- A = #count{ID : target(_,_,Xt,Yt), area(Xt,Yt,ID)}, B = #count{ID : area(_,_,ID)}, A != B.

% Create a trace for each step that a possible target move would take
% We do this at the end to keep possible target vars as few as possible
% Very verbose, was unable to express ascending or descending ranges in asp other than below:
%trace(Xs,Ys,Xt,Yt,Xtr,Ytr) :- target(Xs,Ys,Xt,Yt), Xtr = Xt..Xs, Ytr = Yt..Ys.

trace(Xs,Ys,Xt,Yt,Xtr,Ytr) :- target(Xs,Ys,Xt,Yt), Xtr = Xs..Xt, Ytr = Ys..Yt, Xs<=Xt, Ys<=Yt.
trace(Xs,Ys,Xt,Yt,Xtr,Ytr) :- target(Xs,Ys,Xt,Yt), Xtr = Xt..Xs, Ytr = Ys..Yt, Xt<=Xs,Ys<=Yt.
trace(Xs,Ys,Xt,Yt,Xtr,Ytr) :- target(Xs,Ys,Xt,Yt), Xtr = Xs..Xt, Ytr = Yt..Ys, Xs<=Xt, Yt<=Ys.
trace(Xs,Ys,Xt,Yt,Xtr,Ytr) :- target(Xs,Ys,Xt,Yt), Xtr = Xt..Xs, Ytr = Yt..Ys, Xt<=Xs,Xt<=Ys.


% And remove all the cases where we conflict
:-target(Xs,Ys,Xt,Yt), trace(Xs,Ys,Xt,Yt,Xtr,Ytr), trace(Xs',Ys',Xt',Yt',Xtr,Ytr), Ys != Ys'.
:-target(Xs,Ys,Xt,Yt), trace(Xs,Ys,Xt,Yt,Xtr,Ytr), trace(Xs',Ys',Xt',Yt',Xtr,Ytr), Xs != Xs'.







#show target/4.
