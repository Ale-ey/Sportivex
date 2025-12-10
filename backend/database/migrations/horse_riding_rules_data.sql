-- Horse Riding Rules Data
-- This file contains the initial rules and regulations for horse riding

-- Note: created_by can be set to NULL or a specific admin user ID
-- If you have an admin user, replace NULL with their UUID

-- Rule 1: Mount Assignment
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Mount Assignment',
  'Will be assigned a mount (horse) by the instructor. Members cannot choose the horse themselves.',
  'General',
  1,
  true,
  NULL
);

-- Rule 2: Riding Helmet Requirement
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Riding Helmet Requirement',
  'Will wear a riding helmet for every ride. No other substitute will be allowed.',
  'Safety',
  2,
  true,
  NULL
);

-- Rule 3: Riding Attire
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Riding Attire',
  'Will wear chaps / breeches / riding boots or riding pattees/ anklets.',
  'Safety',
  3,
  true,
  NULL
);

-- Rule 4: Whip and Spur Usage
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Whip and Spur Usage',
  'Will not be allowed to carry a whip or spur without the permission of the instructor.',
  'Equipment',
  4,
  true,
  NULL
);

-- Rule 5: Racing Policy
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Racing Policy',
  'Will not be allowed to race against each other, unless ordered to do so by the instructor.',
  'Conduct',
  5,
  true,
  NULL
);

-- Rule 6: Prohibited Behaviors
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Prohibited Behaviors',
  'Will be severely dealt with in case found:
(1) Mistreating or being cruel to his own mount or any other mount.
(2) Indulges in exchange or use of foul language.
(3) Misbehaving with staff or fellow members.',
  'Conduct',
  6,
  true,
  NULL
);

-- Rule 7: Riding Track Access
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Riding Track Access',
  'Will not insist to take their horses out of the riding school to riding track unless permitted by the instructor/incharge saddle club and having permission certificate for riding on track duly signed by parents.',
  'Safety',
  7,
  true,
  NULL
);

-- Rule 8: Personal Belongings
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Personal Belongings',
  'Members are themselves expected to safe guard their valuable like mobile phones, wallet and watches etc.',
  'General',
  8,
  true,
  NULL
);

-- Rule 9: Vehicle Parking
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Vehicle Parking',
  'Will not take his car / motorcycle beyond the prescribed limits into the club and park his vehicle at designated parking area.',
  'General',
  9,
  true,
  NULL
);

-- Rule 10: Risk Undertaking
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Risk Undertaking',
  'Will sign an under taking for horse riding risks.',
  'Legal',
  10,
  true,
  NULL
);

-- Rule 11: Legal Action Waiver
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Legal Action Waiver',
  'Will undertake that they will not take legal action in any court of law against the Saddle Club in any manner / matter.',
  'Legal',
  11,
  true,
  NULL
);

-- Rule 12: Staff Interaction
INSERT INTO horse_riding_rules (title, content, category, display_order, is_active, created_by)
VALUES (
  'Staff Interaction',
  'Will not indulge in arguments with staff on duty. In case of any complaints, the matter be referred to Secretary.',
  'Conduct',
  12,
  true,
  NULL
);

