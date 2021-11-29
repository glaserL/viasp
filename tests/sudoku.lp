% INSERT NAMES AND EMAIL ADDRESSES OF YOUR GROUP MEMBERS:
% Luis Glaser, Luis.Glaser@uni-potsdam.de

subgrid_size(3).
% HINTS:
% - For subgrid_size(s), subgrids can be identified by labels 0..s*s-1
% - A cell (x,y) can be mapped to the subgrid labeled (((x-1)/s)*s + (y-1)/s)

% Your implementation please...
#const k=9. % took idea from latin square example
square(1..k,1..k).

% and the subgrids, implements above formula:
subgrid(X,Y,G) :- square(X,Y), subgrid_size(S), G = (((X-1)/S)*S + (Y-1)/S).

sudoku(X,Y,N) :- initial(X,Y,N). % transferring input to solution space
1 { sudoku(X,Y,N) : N = 1..k } 1 :- square(X,Y). % wanted to use #count but somehow didnt compile.

% now we avoid linear conflicts
:- sudoku(X,Y,N), sudoku(X,Y',N), Y != Y'.
:- sudoku(X,Y,N), sudoku(X',Y,N), X != X'.

% and conflicting subgrids
:- sudoku(X,Y,N), sudoku(X,Y',N), Y != Y', subgrid(X,Y,G), subgrid(X,Y',G).
:- sudoku(X,Y,N), sudoku(X',Y,N), X != X', subgrid(X,Y,G), subgrid(X',Y,G).
:- sudoku(X,Y,N), sudoku(X',Y',N), X != X', Y != Y', subgrid(X,Y,G), subgrid(X',Y',G).

#show sudoku/3.
