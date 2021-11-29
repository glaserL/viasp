% INSERT NAMES AND EMAIL ADDRESSES OF YOUR GROUP MEMBERS:
% Luis Glaser, Luis.Glaser@uni-potsdam.de
%
#include <incmode>.
% Encoding:
% maxsteps(40).

% field(1..3,1..3).
% start(2,1).
% goal(3,2).
% mino(2,3).

% wall(2,1,2,2).
% wall(2,2,3,2).
% wall(2,2,2,3).
% Before anything, we restructure input
% encode neighboring fields more easily.
#program base.
adj(Xs,Ys,Xt,Yt) :- field(Xs,Ys), field(Xt,Yt), |Xt-Xs|+|Yt-Ys|=1.
dir(-1,0,0). dir(1,0,1). dir(0,-1,2). dir(0,1,3). dir(0,0,4). % taken from yosenabe
wall(X,Y,X',Y') :- wall(X',Y',X,Y).
% Generate
% First step
at(X,Y,0) :- start(X,Y).
minotaur(X,Y,0) :- mino(X,Y).

#program step(t).
% Player movement
1 {at(Xt,Yt,t) : Xt = Xs+Xd, Yt = Ys+Yd, dir(Xd,Yd,_), adj(Xs,Ys,Xt,Yt),
                not wall(Xs,Ys,Xt,Yt), not mino(Xt,Yt,t)}  1 
    :- t <= M, maxsteps(M), at(Xs,Ys,t-1), not goal(Xs,Ys).

%Minotaur movements, split up to be less noisy, each id corresponds to 
% an dir id above. Idea from Atreya.
% go left
minomove(S,0) :- at(Xp,Yp,S/2+1), minotaur(Xm,Ym,S), S <2*t, S>= 2*(t-1),
                    adj(Xm,Ym,Xm-1,Ym), % there is a cell left.
                    |Xp-(Xm-1)|<|Xp-Xm|, % which is closer than rightnow
                    not wall(Xm,Ym,Xm-1,Ym). % and there is no wall

% go right
minomove(S,1) :- at(Xp,Yp,S/2+1), minotaur(Xm,Ym,S),S <2*t, S>= 2*(t-1),
                    adj(Xm,Ym,Xm+1,Ym), % there is a cell right.
                    |Xp-(Xm+1)|<|Xp-Xm|, 
                    not wall(Xm,Ym,Xm+1,Ym). 
% go down
minomove(S,2) :- at(Xp,Yp,S/2+1), minotaur(Xm,Ym,S),S <2*t, S>= 2*(t-1),
                    adj(Xm,Ym,Xm,Ym-1), % there is a cell below.
                    |Yp-(Ym-1)|<|Yp-Ym|, 
                    not wall(Xm,Ym,Xm,Ym-1), 
                    not minomove(S,0), % same as above, but only if didnt move
                    not minomove(S,1). % left or right.
% go up
minomove(S,3) :- at(Xp,Yp,S/2+1), minotaur(Xm,Ym,S),S <2*t, S>= 2*(t-1),
                    adj(Xm,Ym,Xm,Ym+1), % there is a cell above.
                    |Yp-(Ym+1)|<|Yp-Ym|, 
                    not wall(Xm,Ym,Xm,Ym+1), 
                    not minomove(S,0),
                    not minomove(S,1).
% stay
minomove(S,4) :- at(Xp,Yp,S/2+1), minotaur(Xm,Ym,S), S <2*t, S>= 2*(t-1),
                    not minomove(S,0), not minomove(S,1), 
                    not minomove(S,2), not minomove(S,3).

1 {minotaur(Xm+Xd,Ym+Yd,S+1) : minomove(S,ID), dir(Xd,Yd,ID)} 1 :- minotaur(Xm,Ym,S),
                    S <2*t, S>= 2*(t-1).

mino(Xm,Ym,t) :- minotaur(Xm,Ym,2*t), at(_,_,t).
#program check(t).
:- query(t), not at(Xt,Yt,t), goal(Xt,Yt).


#show at/3.
