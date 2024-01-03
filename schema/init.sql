-- 連入資料庫
\c readitagain-data;

-- Create MEMBER table
CREATE TABLE MEMBER (
    UserID SERIAL PRIMARY KEY,
    MemberAccount VARCHAR(20) UNIQUE NOT NULL,
    Password VARCHAR(60) NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Gender VARCHAR(2) NOT NULL,
    RegistrationTime TIMESTAMP NOT NULL,
    Verified VARCHAR(10) NOT NULL,
    Phone VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    BirthDate TIMESTAMP NOT NULL,
    UserType VARCHAR(20) NOT NULL,
    SelfIntroduction VARCHAR(500),
    ProfilePicture VARCHAR(200),
    Authority VARCHAR(100) UNIQUE
);


-- Insert fake data into MEMBER table
INSERT INTO MEMBER (MemberAccount, Password, Name, Gender, RegistrationTime, Verified, Phone, Email, BirthDate, UserType, SelfIntroduction, ProfilePicture, Authority) VALUES 
('gang15', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '錢建宏', '女性', '2020-10-05T22:40:14', '已認證', '022 54277143', 'qinli@example.net', '1989-10-17', 'Standard', '我是錢建宏，我愛大家', 'default.jpg', null),
('yli', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '高志豪', '女性', '2022-08-13T11:47:34', '已認證', '0943-631687', 'weikang@example.net', '2001-03-17', 'Standard', '我是高志豪，我愛大家', 'default.jpg', null),
('zzhu', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '潘依婷', '保密', '2020-07-20T01:18:19', '已認證', '087 67390042', 'hcao@example.com', '1994-07-10', 'Standard', '我是潘依婷，我愛大家', 'default.jpg', null),
('zhangjing', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '吳詩婷', '女性', '2020-01-21T14:30:38', '已認證', '007 10731504', 'gang62@example.com', '1971-05-21', 'Standard', '我是吳詩婷，我愛大家', 'default.jpg', null),
('guiying01', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '董慧君', '男性', '2022-11-08T18:17:29', '已認證', '04-43614189', 'guiyingcao@example.com', '1959-11-05', 'Standard', '我是董慧君，我愛大家', 'default.jpg', null),
('mingguo', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '施雅文', '中性', '2022-01-17T07:49:27', '已認證', '09 8380281', 'fang23@example.net', '1977-01-05', 'Standard', '我是施雅文，我愛大家', 'default.jpg', null),
('leihuang', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '鄧志豪', '女性', '2020-03-19T19:46:23', '已認證', '07 1944666', 'xiulan58@example.com', '1994-06-12', 'Standard', '我是鄧志豪，我愛大家', 'default.jpg', null),
('wei57', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '林淑芬', '男性', '2020-12-01T07:33:25', '已認證', '099 69654723', 'kongchao@example.com', '1986-07-16', 'Standard', '我是林淑芬，我愛大家', 'default.jpg', null),
('luxiuying', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '翟哲瑋', '中性', '2021-10-06T06:14:05', '已認證', '03-1507567', 'bgong@example.net', '1945-04-18', 'Admin', '我是翟哲瑋，我愛大家', 'default.jpg', null),
('min97', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '沈婷婷', '保密', '2020-12-20T06:25:52', '已認證', '0980325724', 'min24@example.com', '1953-02-25', 'Admin', '我是沈婷婷，我愛大家', 'default.jpg', null),
('min39', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '張惠雯', '女性', '2022-05-30T09:28:59', '已認證', '(08) 93150254', 'jun26@example.com', '1952-12-16', 'Admin', '我是張惠雯，我愛大家', 'default.jpg', null),
('xueguiying', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '蔡佳蓉', '中性', '2022-10-07T15:50:30', '未認證', '006 62325613', 'li63@example.net', '1972-10-25', 'Standard', '我是蔡佳蓉，我愛大家', 'default.jpg', null),
('nmeng', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '巫佳蓉', '男性', '2022-10-24T06:37:39', '未認證', '02 9757313', 'wgao@example.com', '1933-03-22', 'Standard', '我是巫佳蓉，我愛大家', 'default.jpg', null),
('li23', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '張馨儀', '保密', '2022-01-12T20:19:55', '未認證', '0980-276511', 'yanjia@example.com', '1949-10-03', 'Standard', '我是張馨儀，我愛大家', 'default.jpg', null),
('wei77', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '田筱涵', '保密', '2021-11-30T19:12:53', '未認證', '03-2953474', 'guiying89@example.org', '1971-01-17', 'Standard', '我是田筱涵，我愛大家', 'default.jpg', null),
('mengjuan', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '劉惠雯', '女性', '2022-05-15T05:41:16', '未認證', '(04) 29291402', 'xiulan69@example.org', '1998-12-17', 'Admin', '我是劉惠雯，我愛大家', 'default.jpg', null),
('minfang', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '何雅萍', '女性', '2022-12-02T20:51:46', '未認證', '0919642301', 'ehe@example.com', '1974-10-21', 'Admin', '我是何雅萍，我愛大家', 'default.jpg', null),
('dailei', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '王美琪', '女性', '2020-01-04T18:04:09', '未認證', '087 35604269', 'qzhang@example.org', '1993-03-20', 'Admin', '我是王美琪，我愛大家', 'default.jpg', null),
('yan91', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '張佳蓉', '男性', '2023-08-25T14:34:34', '未認證', '01-87605207', 'okong@example.net', '1987-11-20', 'Admin', '我是張佳蓉，我愛大家', 'default.jpg', null),
('gongna', '$2b$12$287HtfigM1kBCQVfRXnac.IbdnmFrvPTYNLHroXPIuMg2k4GHnK4y', '鄭佳穎', '男性', '2023-06-09T21:37:48', '未認證', '06-50953265', 'fang76@example.net', '1988-06-28', 'Admin', '我是鄭佳穎，我愛大家', 'default.jpg', null);

-- Create CUSTOMER table
CREATE TABLE CUSTOMER (
    CustomerID INTEGER PRIMARY KEY REFERENCES MEMBER(UserID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Insert fake data into CUSTOMER table
INSERT INTO CUSTOMER (CustomerID) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8);

-- Create SELLER table
CREATE TABLE SELLER (
    SellerID INTEGER PRIMARY KEY REFERENCES MEMBER(UserID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Insert fake data into SELLER table
INSERT INTO SELLER (SellerID) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8);

-- Create ADMINISTRATOR table
CREATE TABLE ADMINISTRATOR (
    AdministratorID INTEGER PRIMARY KEY REFERENCES MEMBER(UserID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Insert fake data into ADMINISTRATOR table
INSERT INTO ADMINISTRATOR (AdministratorID) VALUES
(9),
(10),
(11);

-- Create ORDERS table
CREATE TABLE ORDERS (
    OrderID SERIAL PRIMARY KEY,
    SellerID INTEGER NOT NULL REFERENCES SELLER(SellerID) ON UPDATE CASCADE ON DELETE CASCADE,
    CustomerID INTEGER NOT NULL REFERENCES CUSTOMER(CustomerID) ON UPDATE CASCADE ON DELETE CASCADE,
    OrderStatus VARCHAR(50) NOT NULL,
    CancellationReason VARCHAR(50),
    Time TIMESTAMP NOT NULL,
    TotalAmount INTEGER NOT NULL,
    TotalBookCount INTEGER NOT NULL,
    Comment VARCHAR(500),
    ShippingMethod VARCHAR(20),
    Stars INTEGER
);

-- Insert fake data into ORDER table
INSERT INTO ORDERS (SellerID, CustomerID, OrderStatus, CancellationReason, Time, TotalAmount, TotalBookCount, Comment, ShippingMethod, Stars) VALUES
(2, 1, 'Completed', null, '2021-01-02 15:00:00', 400, 2, '人很NICE!', '全家', 5);

-- Create DISCOUNT table
CREATE TABLE DISCOUNT (
    DiscountCode SERIAL PRIMARY KEY,
    SellerID INTEGER NOT NULL REFERENCES SELLER(SellerID) ON UPDATE CASCADE ON DELETE CASCADE,
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50) NOT NULL CHECK (Type IN ('shipping fee', 'seasoning', 'special event')),
    Description VARCHAR(500) NOT NULL,
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    IsActivated BOOLEAN,
    DiscountRate FLOAT,
    EventTag VARCHAR(50),
    MinimumAmountForDiscount INTEGER
    CONSTRAINT check_shipping_fee_type CHECK (Type != 'shipping fee' OR (Type = 'shipping fee' AND MinimumAmountForDiscount IS NOT NULL)), --shipping fee 一定要配最小applied門檻
    CONSTRAINT check_special_event_type CHECK (Type != 'special event' OR (Type = 'special event' AND EventTag IS NOT NULL)), --special event一定要有event tag
    CONSTRAINT check_seasoning_type CHECK (Type != 'seasoning' OR (Type = 'seasoning' AND DiscountRate IS NOT NULL AND MinimumAmountForDiscount IS NOT NULL)) --seasoning一定要有折價Rate且最小applied金額
);


-- Insert fake data into DISCOUNT table
INSERT INTO DISCOUNT (SellerID, Name, Type, Description, StartDate, EndDate, IsActivated, DiscountRate, EventTag, MinimumAmountForDiscount)
VALUES 
(2, '暑期促銷', 'seasoning', '所有書籍9折', '2023-07-01 00:00:00', '2023-10-01 23:59:59', true, 0.9, null, 200),
(2, '免運券', 'shipping fee', '滿200免運費', '2024-01-01 00:00:00', '2024-02-01 23:59:59', true, null, null, 200),
(2, '好禮額外送', 'special event', '現在買小王子就額外送親子繪本', '2023-07-01 00:00:00', '2024-02-01 23:59:59', true, null, '額外好禮', null),
(3, '50折價券', 'seasoning', '只要滿200額外折價50元', '2023-07-01 00:00:00', '2024-02-01 23:59:59', true, 50.0, null, 200),
(3, '買一送一', 'special event', '現在哈利波特買一送一', '2023-07-01 00:00:00', '2024-02-01 23:59:59', true, null, '買一送一', null);




-- Create BOOK table
CREATE TABLE BOOK (
    BookID SERIAL PRIMARY KEY,
    SellerID INTEGER NOT NULL REFERENCES SELLER(SellerID) ON UPDATE CASCADE ON DELETE CASCADE,
    OrderID INTEGER REFERENCES ORDERS(OrderID) ON UPDATE CASCADE ON DELETE CASCADE,
    DiscountCode INTEGER REFERENCES DISCOUNT(DiscountCode) ON UPDATE CASCADE ON DELETE CASCADE,
    ISBN VARCHAR(20) NOT NULL,
    ShippingLocation VARCHAR(6) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Condition VARCHAR(10) NOT NULL,
    Price INTEGER NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    State VARCHAR(20) NOT NULL
);

-- Insert fake data into BOOK table
INSERT INTO BOOK (SellerID, OrderID, DiscountCode, ISBN, ShippingLocation , Name, Condition, Price, Description, Category, State) VALUES 
(3, null, 5, '978-3-16-148410-0', '台北市', '哈利波特', '新', 500, '這是一本關於魔法的書。', 'Fantasy', 'on sale'),
(2, null, 3, '978-3-16-148411-7', '高雄市', '小王子', '二手', 300, '一本經典的兒童文學作品。', 'Children', 'on sale'),
(2, 1, null, '978-3-16-148411-8', '高雄市', '微積分', '二手', 200, '北科大一微積分', 'Math', 'sold'),
(3, null, null, '978-3-16-148411-8', '高雄市', '小王子', '二手', 200, '一本經典的兒童文學作品。', 'Children', 'on sale');

-- Create PICTURE_LIST table
CREATE TABLE PICTURE_LIST (
    PictureID SERIAL PRIMARY KEY,
    BookID INTEGER NOT NULL REFERENCES BOOK(BookID) ON UPDATE CASCADE ON DELETE CASCADE,
    PicturePath VARCHAR(200) NOT NULL
);

-- Insert fake data into PICTURE_LIST table
INSERT INTO PICTURE_LIST (BookID, PicturePath) VALUES
(1, 'book01.jpg'),
(2, 'book02_01.jpg'),
(2, 'book02_02.jpg'),
(3, 'book03_01.jpg'),
(3, 'book03_02.jpg'),
(4, 'book04.jpg');

-- Create SHOPPING_CART table
CREATE TABLE SHOPPING_CART (
    ShoppingCartID SERIAL PRIMARY KEY,
    CustomerID INTEGER NOT NULL REFERENCES CUSTOMER(CustomerID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Insert fake data into SHOPPING_CART table
INSERT INTO SHOPPING_CART (CustomerID) VALUES
(1);

-- Create LIKE_LIST TABLE
CREATE TABLE LIKE_LIST (
    SellerID INTEGER REFERENCES SELLER(SellerID) ON UPDATE CASCADE ON DELETE CASCADE,
    CustomerID INTEGER REFERENCES CUSTOMER(CustomerID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (SellerID, CustomerID)
);

-- Insert fake data into LIKE_LIST table
INSERT INTO LIKE_LIST (SellerID, CustomerID) VALUES
(2, 1);

-- Create APPLIED_LIST TABLE
CREATE TABLE APPLIED_LIST (
    OrderID INTEGER REFERENCES ORDERS(OrderID) ON UPDATE CASCADE ON DELETE CASCADE,
    DiscountCode INTEGER REFERENCES DISCOUNT(DiscountCode) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (OrderID, DiscountCode)
);

-- Insert fake data into APPLIED_LIST table
INSERT INTO APPLIED_LIST (OrderID, DiscountCode) VALUES
(1, 2);

-- Create Cart_List TABLE
CREATE TABLE CART_LIST (
    ShoppingCartID INTEGER NOT NULL REFERENCES SHOPPING_CART(ShoppingCartID) ON UPDATE CASCADE ON DELETE CASCADE,
    BookID INTEGER NOT NULL REFERENCES BOOK(BookID) ON UPDATE CASCADE ON DELETE CASCADE,
    id SERIAL PRIMARY KEY
);

-- Insert fake data into Cart_List table
INSERT INTO CART_LIST VALUES 
(1, 1),
(1, 2);

-- Create ADDRESS_LIST TABLE
CREATE TABLE ADDRESS_LIST (
    AddressID SERIAL PRIMARY KEY,
    CustomerID INTEGER REFERENCES CUSTOMER(CustomerID) ON UPDATE CASCADE ON DELETE CASCADE,
    Address VARCHAR(200),
    ShippingOption VARCHAR(50),
    DefaultAddress BOOLEAN
);

-- Insert fake data into ADDRESS_LIST table
INSERT INTO ADDRESS_LIST (CustomerID, Address, ShippingOption, DefaultAddress) VALUES 
(1, '67169 台中和街巷4號9樓', '快遞', true),
(1, '台北市大安區基隆路二段142之1號及142之2號', '7-ELEVEN', true),
(1, '台北市信義區吳興街156巷2弄2號4號1樓', '7-ELEVEN', false);

-- Create SHIPPINGMETHOD_LIST TABLE
CREATE TABLE SHIPPINGMETHOD_LIST (
    ShippingMethodID SERIAL PRIMARY KEY,
    SellerID INTEGER REFERENCES SELLER(SellerID) ON UPDATE CASCADE ON DELETE CASCADE,
    ShippingMethod VARCHAR(20)
);

-- Insert fake data into SHIPPINGMETHOD_LIST table
INSERT INTO SHIPPINGMETHOD_LIST(SellerID, ShippingMethod) VALUES
(1, '7-ELEVEN'),
(2, '7-ELEVEN'),
(3, '7-ELEVEN'),
(4, '7-ELEVEN'),
(5, '7-ELEVEN'),
(6, '7-ELEVEN'),
(7, '7-ELEVEN'),
(8, '7-ELEVEN'),
(1, '全家'),
(2, '全家'),
(3, '全家'),
(4, '全家'),
(5, '全家'),
(6, '全家'),
(7, '全家'),
(8, '全家'),
(1, '快遞'),
(2, '快遞'),
(3, '快遞'),
(4, '快遞'),
(5, '快遞'),
(6, '快遞'),
(7, '快遞'),
(8, '快遞');


-- Create SPECIALIZED TABLE
CREATE TABLE SPECIALIZED (
    DiscountCode INTEGER REFERENCES DISCOUNT(DiscountCode) ON UPDATE CASCADE ON DELETE CASCADE,
    BookID INTEGER REFERENCES BOOK(BookID) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (DiscountCode, BookID)
);

-- Insert fake data into SPECIALIZED table
INSERT INTO SPECIALIZED VALUES 
(3, 2),
(5, 1);