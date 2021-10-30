module Player where

import           Parser.Parser      -- This is the source for the parser from the course notes
import           Cards              -- Finally, the generic card type(s)

import           TwentyOne.Types    -- Here you will find types used in the game of TwentyOne
import           TwentyOne.Rules    -- Rules of the game

-- You can add more imports if you need them
import           Data.Char
import           Parser.Instances
-- parser extras from the week 11 tutorial

satisfy :: (Char -> Bool) -> Parser Char
satisfy f = do
  c <- character
  if (f c) then pure c else unexpectedCharParser c


digit :: Parser Char
digit = satisfy isDigit

string :: String -> Parser String
string = traverse (is)

list1 :: Parser a -> Parser [a]
list1 p = do
  q <- p
  r <- list p 
  pure (q:r)

list :: Parser a -> Parser [a]
list p = list1 p ||| pure []

space :: Parser Char
space = satisfy isSpace

spaces :: Parser String
spaces = list space

tok :: Parser a -> Parser a
tok p = p >>= (\r -> spaces >> pure r)

charTok :: Char -> Parser Char
charTok c = tok (is c)

stringTok :: String -> Parser String
stringTok s = tok $ string s


sepby1 :: Parser a -> Parser s -> Parser [a]
sepby1 p1 p2 = do
    x <- p1
    xs <- list (p2 >>p1)
    pure(x:xs)

between :: Parser o -> Parser c -> Parser a -> Parser a
between p1 p2 p3 = do
  _ <- p1
  x <- p3
  _ <- p2
  return x

betweenCharTok :: Char -> Char -> Parser a -> Parser a
betweenCharTok a b p = do
                       _ <-charTok a
                       r <- p
                       _ <-charTok b
                       pure r

betweenStringTok :: String -> String -> Parser a -> Parser a
betweenStringTok a b p = do
                       _ <-stringTok a
                       r <- p
                       _ <-stringTok b
                       pure r

-- | This function get the useful data types from the ParseResult
getResult :: ParseResult t -> t
getResult (Result _ x) = x
getResult _ = error "Invalid Parse Result"

-- below parses are redundant. Can just use betweenCharTok for this. remove these after implementing

-- end of redundant
-- getActionMem gets the action that was last saved in memory
getActionMem::Maybe String -> [Char]
getActionMem Nothing = ""
getActionMem (Just mem) = getResult (parse (betweenCharTok '(' ':' (string "Hit"|||string "Stand") ) mem)

-- this is a messy implementation of the getPlayerID function. I was using a Parser String but it was giving errors and this was the only one I could come up with that didnt throw an error
getPlayerBidMem::Maybe String -> Int
getPlayerBidMem Nothing = -1
getPlayerBidMem (Just mem) = unPackPlayerBidtoInt(readInt (getResult (parse (betweenStringTok "(Bid:" ":"  (string "100"|||string "10")) mem)))

-- a function to turn the Maybe (Int,String) returned by readInt into an Int

unPackPlayerBidtoInt:: Maybe (Int, String) -> Int 
unPackPlayerBidtoInt Nothing = -1
unPackPlayerBidtoInt (Just (x,y)) =  x


-- | Play function type.
-- type PlayFunc
--     =  Maybe Card         -- Dealer's up-card
--     -> [PlayerPoints]     -- Points for all players in game
--     -> [PlayerInfo]       -- the most recent information for all players
--     -> PlayerId           -- the player's id
--     -> Maybe String       -- the player's memory
--     -> Hand               -- the player's hand
--     -> (Action, String)   -- the player's chosen action and new memory

-- | This function is called once it's your turn, and keeps getting called until your turn ends.
-- check if dealer has any upcard.
-- its the first turn if dealer has Nothing
-- parse memory to get current players information
-- make a minimum bid 




playCard :: PlayFunc
playCard Nothing plyer_points plyer_info plyer_id Nothing plyer_hnd = (Bid pbid,"(Bid:" ++ show pbid ++ ":" ++  plyer_id ++";")
  where
    pbid = makeBid plyer_points plyer_id plyer_hnd
playCard Nothing plyer_points plyer_info plyer_id (Just plyer_mem) plyer_hnd = (Bid pbid,"(Bid:" ++ show pbid ++ ":" ++  plyer_id ++";" ++ plyer_mem)
  where
    pbid = makeBid plyer_points plyer_id plyer_hnd
playCard (Just dler_crd) plyer_points plyer_info plyer_id (Just plyer_mem) plyer_hnd 
        | toPoints dler_crd == 11 && handCalc plyer_hnd <= 17 = (Hit,"(Hit:" ++ plyer_id ++";" ++ plyer_mem)  
        | toPoints dler_crd >=7 && toPoints dler_crd <=10 && handCalc plyer_hnd >= 17 = (Stand,"(Stand:" ++ plyer_id ++";" ++ plyer_mem)
        | toPoints dler_crd >=7 && toPoints dler_crd <=10 && handCalc plyer_hnd < 17 = (Hit,"(Hit:" ++ plyer_id ++";" ++ plyer_mem)
        | toPoints dler_crd >=3 && toPoints dler_crd <=6 &&( handCalc plyer_hnd <= 8 ||handCalc plyer_hnd == 12) = (Hit ,"(Hit:" ++ plyer_id ++";" ++ plyer_mem)
        | toPoints dler_crd >=2 && toPoints dler_crd <=6 && handCalc plyer_hnd >= 13 = (Stand ,"(Hit:" ++ plyer_id ++";" ++ plyer_mem)
        | otherwise = (Stand ,"(Stand:" ++ plyer_id ++";" ++ plyer_mem)
playCard (Just dler_crd) plyer_points plyer_info plyer_id Nothing plyer_hnd = (Stand,"")

-- | toPoints dler_crd >=2 && toPoints dler_crd <=6 &&( handCalc plyer_hnd >= 9 && handCalc plyer_hnd <= 11) = (DoubleDown minBid ,plyer_mem)
makeBid:: [PlayerPoints] -> PlayerId -> Hand-> Int
makeBid arr pid phnd 
        | curPoints >= maxBid && isCombo phnd = maxBid  
        | otherwise = minBid  
        where curPoints = find' getPoints pid getId arr