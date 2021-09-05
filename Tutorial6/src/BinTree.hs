-- | Implementation of integer valued binary trees.
module BinTree where


-- | A 'BinTree' is a type of tree which is either a 'Leaf' with no values, or
-- a 'Label' with a value and two sub-trees.
data BinTree = Leaf | Label Int BinTree BinTree
  deriving (Show)

-- $setup
-- >>> tree = Label 16 (Label 23 Leaf (Label 73 Leaf Leaf)) (Label 42 Leaf Leaf)
-- >>> one = Label 1 Leaf Leaf

-- | Find the depth of a tree (number of levels)
--
-- >>> depth Leaf
-- 0
--
-- >>> depth (Label 1 Leaf Leaf)
-- 1
--
-- >>> depth tree
-- 3
depth :: BinTree -> Int
depth (Leaf) = 0
depth (Label _ child1 child2) = 1 + max (depth child1) (depth child2)

-- | Find the number of nodes in a tree.
--
-- >>> size Leaf
-- 0
--
-- >>> size one
-- 1
--
-- >>> size tree
-- 4
size :: BinTree -> Int
size (Leaf) = 0
size (Label _ child1 child2) = 1 + (size child1) + (size child2)

-- | Sum the elements of a numeric tree.
--
-- >>> sumTree Leaf
-- 0
--
-- >>> sumTree one
-- 1
--
-- >>> sumTree tree
-- 154
--
-- prop> sumTree (Label v Leaf Leaf) == v
sumTree :: BinTree -> Int
sumTree (Leaf) = 0
sumTree (Label a child1 child2) = (sumTree child1) + a + (sumTree child2)

 
-- | Find the minimum element in a tree.
--
-- E.g., minTree @(your pattern here)@ = error "Tree is empty"
--
-- >>> minTree one
-- 1
--
-- >>> minTree tree
-- 16
--
minTree :: BinTree -> Int
minTree Leaf = error "Tree is empty"
minTree (Label a Leaf Leaf) = a
minTree (Label a Leaf child2) = min (minTree child2) a
minTree (Label a child1 Leaf) = min (minTree child1) a
minTree (Label a child1 child2) = minimum[(minTree child1), (minTree child2), a]


-- | Map a function over a tree.
--
-- >>> mapTree (+1) Leaf
-- Leaf
--
-- >>> mapTree (*1) one
-- Label 1 Leaf Leaf
--
-- >>> mapTree ((flip mod) 2) tree
-- Label 0 (Label 1 Leaf (Label 1 Leaf Leaf)) (Label 0 Leaf Leaf)
mapTree :: (Int -> Int) -> BinTree -> BinTree
mapTree f Leaf = Leaf
mapTree f (Label a child1 child2) = (Label (f a) (mapTree f child1) (mapTree f child2))
