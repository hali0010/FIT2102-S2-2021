{-# LANGUAGE InstanceSigs #-}

module Instances where

import qualified Numeric                       as N

-- $setup
-- >>> let p = \n -> P (\x -> Result x n)
-- >>> let add = \n -> \m -> P (\x -> Result x (n+m))

data ParseError =
    UnexpectedEof
  | ExpectedEof Input
  | UnexpectedChar Char
  | UnexpectedString String
  deriving (Eq, Show)

data ParseResult a =
    Error ParseError
  | Result Input a
  deriving Eq

type Input = String
newtype Parser a = P { parse :: Input -> ParseResult a}

-- Result Instances

instance Show a => Show (ParseResult a) where
    show (Result i a                ) = "Result >" ++ i ++ "< " ++ show a
    show (Error UnexpectedEof       ) = "Unexpected end of stream"
    show (Error (UnexpectedChar   c)) = "Unexpected character: " ++ show [c]
    show (Error (UnexpectedString s)) = "Unexpected string: " ++ show s
    show (Error (ExpectedEof i)) =
        "Expected end of stream, but got >" ++ show i ++ "<"

instance Functor ParseResult where
    fmap f (Result i a) = Result i (f a)
    fmap _ (Error e   ) = Error e

-- Parser Instances

-- | Functor instance for a paser
--
-- >>> parse ((+1) <$> P (`Result` 1)) "hello"
-- Result >hello< 2

--  >>> parse ((+1) <$> P (const (Error UnexpectedEof))) "hello"
-- Unexpected end of stream
instance Functor Parser where
    fmap :: (a -> b) -> Parser a -> Parser b
    fmap f (P p) = P (fmap f . p) 



-- | Implement this before Applicative Parser!
--
-- >>> parse (p 1 >>= add 2) ""
-- Result >< 3
--
-- prop> \i j -> parse (p i >>= add j) "" == Result "" (i + j)
instance Monad Parser where
    (>>=) :: Parser a -> (a -> Parser b) -> Parser b
    (>>=) (P p) f = P (
        \i -> case p i of
        Result rest x -> parse (f x) rest
        Error e -> Error e)

-- |
--
-- >>> parse (P (`Result` (+1)) <*> P (`Result` 1)) "hello"
-- Result >hello< 2
--
-- >>> parse (pure (+1) <*> P (`Result` 1)) "hello"
-- Result >hello< 2
--
-- >>> parse (pure (+1) <*> (pure 1 :: Parser Int)) "hello"
-- Result >hello< 2
instance Applicative Parser where
    -- creates a Parser that always succeeds with the given input
    pure :: a -> Parser a
    pure  x = P (`Result` x)

    -- /Hint/ use `pure` and `bind`
    (<*>) :: Parser (a -> b) -> Parser a -> Parser b
    (<*>) p q = p >>= (\f -> q >>= (pure . f))

    --(<*>) p q = do
        --f <- p
        --q (pure . f))
 -- f<$>q
-- Support functions

isErrorResult :: ParseResult a -> Bool
isErrorResult (Error _) = True
isErrorResult _         = False

readFloats :: (RealFrac a) => String -> Maybe (a, String)
readFloats str = case N.readSigned N.readFloat str of
    ((a, s) : _) -> Just (a, s)
    _            -> Nothing

readHex :: (Num a, Eq a) => String -> Maybe (a, String)
readHex str = case N.readHex str of
    ((a, s) : _) -> Just (a, s)
    _            -> Nothing

readInt :: String -> Maybe (Int, String)
readInt s = case reads s of
    [(x, rest)] -> Just (x, rest)
    _           -> Nothing
