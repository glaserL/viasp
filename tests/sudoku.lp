% INSERT NAMES AND EMAIL ADDRESSES OF YOUR GROUP MEMBERS:
% Luis Glaser, Luis.Glaser@uni-potsdam.de

#const k=9. % took idea from latin square example

initial(2,3,3).
initial(3,3,8).
initial(4,3,1).
initial(5,3,4).
initial(6,3,6).
initial(7,3,5).
initial(8,3,9).
initial(9,3,2).
initial(1,4,5).
initial(2,4,7).
initial(3,4,2).
initial(4,4,8).
initial(5,4,1).
initial(6,4,3).
initial(7,4,9).
initial(8,4,6).
initial(9,4,4).
initial(1,5,4).
initial(2,5,1).
initial(3,5,3).
initial(4,5,9).
initial(5,5,6).
initial(6,5,2).
initial(7,5,7).
initial(8,5,5).
initial(9,5,8).
initial(1,6,9).
initial(2,6,8).
initial(3,6,6).
initial(4,6,5).
initial(5,6,7).
initial(6,6,4).
initial(7,6,2).
initial(8,6,1).
initial(9,6,3).
initial(1,7,2).
initial(2,7,5).
initial(3,7,1).
initial(4,7,6).
initial(5,7,3).
initial(6,7,8).
initial(7,7,4).
initial(8,7,7).
initial(9,7,9).
initial(1,8,8).
initial(2,8,6).
initial(3,8,4).
initial(4,8,2).
initial(5,8,9).
initial(6,8,7).
initial(7,8,1).
initial(8,8,3).
initial(9,8,5).
initial(1,9,3).
initial(2,9,9).
initial(3,9,7).
initial(4,9,4).
initial(5,9,5).
initial(6,9,1).
initial(7,9,8).
initial(8,9,2).

subgrid_size(3).
% HINTS:
% - For subgrid_size(s), subgrids can be identified by labels 0..s*s-1
% - A cell (x,y) can be mapped to the subgrid labeled (((x-1)/s)*s + (y-1)/s)

% Your implementation please...
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
