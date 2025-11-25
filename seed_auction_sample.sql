-- Sample auction data for testing

-- Create sample auctions for artworks 1, 2, 3
INSERT INTO auctions (artwork_id, seller_id, starting_price, current_price, reserve_price, end_time, status, total_bids)
VALUES 
  (1, 1, 0.5, 0.75, 0.6, datetime('now', '+7 days'), 'active', 3),
  (2, 2, 1.0, 1.5, 1.2, datetime('now', '+5 days'), 'active', 5),
  (3, 3, 2.0, 2.0, 1.8, datetime('now', '+10 days'), 'active', 0);

-- Create sample bids for auction 1
INSERT INTO auction_bids (auction_id, bidder_id, bid_amount, is_winning_bid)
VALUES 
  (1, 2, 0.55, 0),
  (1, 3, 0.65, 0),
  (1, 4, 0.75, 1);

-- Create sample bids for auction 2
INSERT INTO auction_bids (auction_id, bidder_id, bid_amount, is_winning_bid)
VALUES 
  (2, 1, 1.1, 0),
  (2, 3, 1.25, 0),
  (2, 4, 1.35, 0),
  (2, 5, 1.45, 0),
  (2, 1, 1.5, 1);

-- Update auction winners
UPDATE auctions SET winner_id = 4, winning_bid_id = 3 WHERE id = 1;
UPDATE auctions SET winner_id = 1, winning_bid_id = 8 WHERE id = 2;
