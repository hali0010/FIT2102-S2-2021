module Player where

import           Parser.Parser      -- This is the source for the parser from the course notes
import           Cards              -- Finally, the generic card type(s)

import           TwentyOne.Types    -- Here you will find types used in the game of TwentyOne
import           TwentyOne.Rules    -- Rules of the game

import Debug.Trace
import Data.Csv.Incremental (HeaderParser(FailH))
import Data.Char
import Parser.Instances
import Text.Read.Lex (Lexeme(Number))

-- You can add more imports if you need them

-- | This is the defintion of data type CountBid and it stores the count 
-- and bid
data CountBid = CountBid {count::String, bid::String}
    deriving (Show)

-- | This function is called once it's your turn, and keeps getting called 
-- until your turn ends. 
-- It bids and performs an action. Another version of the function is 
-- commented out. It helps in debugging the code. It can only be sued 
-- when the other version if commented out

-- playCard :: PlayFunc
-- playCard Nothing _ _ _ playerMemory playerHand = (Bid (decideBid playerHand 
--     playerMemory), updateMemory playerHand playerMemory)
-- playCard (Just dealerUpCard) playerPoints _ playerId playerMemory playerHand = 
--     (decideAction playerHand dealerUpCard playerPoints playerId playerMemory, 
--     updateMemory playerHand playerMemory)

playCard :: PlayFunc
playCard Nothing playerPoints playerInfo playerId memory hand
    | trace ( "\nplayerId: " ++ show playerId ++
    "\nplayerPoints: " ++ show playerPoints ++
    "\nplayerInfo: " ++ show playerInfo ++
    "\nmemory: " ++ show memory ++ 
    "\nhand: " ++ show hand ++ 
    "\npoints: " ++ show (findPoints playerPoints playerId)) 
    False = undefined
    | otherwise = (Bid (decideBid hand memory), updateMemory hand memory)
playCard (Just card) playerPoints playerInfo playerId memory hand
    | trace ( "\nplayerId: " ++ show playerId ++
    "\ncard: " ++ show card ++
    "\nplayerPoints: " ++ show playerPoints ++
    "\nplayerInfor: " ++ show playerInfo ++
    "\nmemory: " ++ show memory ++
    "\nhand: " ++ show hand ++ 
    "\npoints: " ++ show (findPoints playerPoints playerId))
    False = undefined
    | otherwise = (decideAction hand card playerPoints playerId memory, updateMemory hand memory)

-- | This function figures out which action to take based on the players hand
-- and the dealer's up card. It is based on blackjack basic strategy tables
-- found online
decideAction :: Hand -> Card -> [PlayerPoints] -> PlayerId -> Maybe String -> Action
decideAction myHand dealerUpCard playerPoints playerId memory
    | (handCalc myHand >= 2) && (handCalc myHand <= 8) = Hit
    | (handCalc myHand == 9) && ((toPoints dealerUpCard == 2) || 
    (toPoints dealerUpCard >= 7) && (toPoints dealerUpCard <= 11)) = Hit
    | (handCalc myHand == 9) && ((toPoints dealerUpCard >= 3) && 
    (toPoints dealerUpCard <= 6)) && 
    (findPoints playerPoints playerId - memoryBid memory >= 0) 
    = DoubleDown (memoryBid memory)
    | (handCalc myHand == 10) && ((toPoints dealerUpCard >= 2) && 
    (toPoints dealerUpCard <= 9)) && 
    (findPoints playerPoints playerId - memoryBid memory >= 0) 
    = DoubleDown (memoryBid memory)
    | (handCalc myHand == 10) && ((toPoints dealerUpCard >= 10) 
    && (toPoints dealerUpCard <= 11)) = Hit
    | (handCalc myHand == 11) && ((toPoints dealerUpCard >= 2) 
    && (toPoints dealerUpCard <= 11)) && 
    (findPoints playerPoints playerId - memoryBid memory >= 0) = 
        DoubleDown (memoryBid memory)
    | (handCalc myHand == 11) && (toPoints dealerUpCard == 11) = Hit
    | (handCalc myHand == 12) && (((toPoints dealerUpCard >= 2) && 
    (toPoints dealerUpCard <= 3)) || ((toPoints dealerUpCard >= 7) && 
    (toPoints dealerUpCard <= 11))) = Hit
    | (handCalc myHand == 12) && ((toPoints dealerUpCard >= 4) && 
    (toPoints dealerUpCard <= 6)) = Stand
    | ((handCalc myHand >= 13) || (handCalc myHand == 16)) && 
    ((toPoints dealerUpCard >= 2) && (toPoints dealerUpCard <= 6)) = Stand
    | ((handCalc myHand >= 13) || (handCalc myHand <= 16)) && 
    ((toPoints dealerUpCard >= 7) && (toPoints dealerUpCard <= 11)) = Hit
    | (handCalc myHand >= 17) && (handCalc myHand <= 21) = Stand
    | otherwise =  Stand

-- | This function calculates the count and decides the bid that should be 
-- placed
decideBid :: Hand -> Maybe String -> Int
decideBid hand memory
    | newCount hand memory > 0 = maxBid
    | newCount hand memory <= 0 = minBid
    | otherwise = minBid 
-- | otherwise = (maxBid-minBid) `div` 2

-- Helper Functions

-- | This function finds the points for a particular id
findPoints :: [PlayerPoints] -> PlayerId -> Int
findPoints playerPoints playerId = find' getPoints playerId getId playerPoints

-- | This function calculates the new count taking the count in the previous 
--hand from memory
newCount :: Hand -> Maybe String -> Int
newCount hand memory
    | ((currentCount + memoryCount memory) > currentCount) || 
    ((currentCount + memoryCount memory) < currentCount) = 
        currentCount + memoryCount memory
    | otherwise = currentCount
    where currentCount = calculateCount hand

-- | This function calculates the count based on the current hand being played
calculateCount :: Hand -> Int
calculateCount hand
    | handCalc hand >= 12 = -1
    | handCalc hand < 7 = 1
    | otherwise = 0

-- | Memory string is updated with new count and new bid
updateMemory :: Hand -> Maybe String -> String
updateMemory hand memory = show (newCount hand memory) ++ "/" ++ 
    show (decideBid hand memory)

-- | Overall function that uses all other function to parse the memory into
-- useful data which will be used to make a better decision
memoryCount :: Maybe String -> Int
memoryCount memory = 
    int $ getCount $ getResult $ parseMemory $ convertMaybeString memory

-- | Overall function that uses all other function to parse the memory into
-- useful data which will be used to make a better decision
memoryBid :: Maybe String -> Int
memoryBid memory = 
    int $ getBid $ getResult $ parseMemory $ convertMaybeString memory

-- | This function was derived from readInt in Instances.hs to convert a 
-- String into Int
int :: String -> Int
int s = case reads s of
            [(x,_)] -> x
            _ -> 0

-- | Convert a Maybe String into String
convertMaybeString :: Maybe String -> String
convertMaybeString (Just a) = a
convertMaybeString Nothing = "0/0"

-- | This function parses the memory string
parseMemory :: String -> ParseResult CountBid
parseMemory = parse countBidParser

-- This is the parser that gets us the information into the data type
countBidParser :: Parser CountBid
countBidParser = do
    count <- list parseNum
    _ <- is '/'
    bid <- list parseNum
    return $ CountBid count bid

-- | This function gets the data type from ParseResult
getResult :: ParseResult a -> a
getResult (Result _ a) = a
getResult (Error _) = error "Did not parse successfully"

-- | This function gets the count in the CountBid data type
getCount :: CountBid -> String
getCount = count

-- | This function gets the bid in the CountBid data type
getBid :: CountBid -> String
getBid = bid

-- | This parser characters that are in integer
parseNum :: Parser Char
parseNum =
    is '-' |||
    is '0' |||
    is '1' |||
    is '2' |||
    is '3' |||
    is '4' |||
    is '5' |||
    is '6' |||
    is '7' |||
    is '8' |||
    is '9'

-- | Return a parser that continues producing a list of values from the 
-- given parser.
list :: Parser a -> Parser [a]
list p1 = list1 p1 ||| pure []

-- | Return a parser that produces at least one value from the given parser
-- then continues producing a list of values from the given parser (to
-- ultimately produce a non-empty list).
list1 :: Parser a -> Parser [a]
list1 p = do
  p' <- p
  p'' <- list p
  pure (p' : p'')
