-- | Example questions using hoogle


module Examples where

import Prelude

-- $setup

-- | Calculate eulerProblem1
--
-- >>> eulerProblem1 1000
-- 233168
eulerProblem1 :: Int -> Int
eulerProblem1 0 = 0
eulerProblem1 n = eulerProblem1aux (n-1)

eulerProblem1aux:: Int -> Int
eulerProblem1aux 0 = 0
eulerProblem1aux n = if mod n 3 == 0 || mod n 5 == 0 then n + eulerProblem1aux (n-1) else eulerProblem1aux (n-1)
-- | Function to check if every element in a list is even
--
-- >>> allEvens [1,2,3,4,5]
-- False
-- >>> allEvens [2,4]
-- True
allEvens :: [Int] -> Bool
allEvens = all even
-- | Function to check if any element is odd
  --
-- >>> anyOdd [1,2,3,4,5]
-- True
-- >>> anyOdd [0,0,0,4]
-- False
anyOdd :: [Int] -> Bool
anyOdd = any odd

-- | Function to sum every element in two lists
--
-- >>> sumTwoLists [1,2,3,4,5] [1,2,3,4,5]
-- [2,4,6,8,10]
sumTwoLists :: [Int] -> [Int] -> [Int]
sumTwoLists a b = zipWith (+) a b

-- | Function to make a list of the first item of each pair in a list of pairs
--
-- >>> firstItem [(2,1), (4,3), (6,5)]
-- [2,4,6]
firstItem :: [(a,b)] -> [a]
firstItem l = map (fst) l
