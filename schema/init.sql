-- 連入資料庫
\c readitagain-data;

-- Create MEMBER table
CREATE TABLE MEMBER (
    UserID VARCHAR(20) PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Gender BOOLEAN NOT NULL,
    RegistrationTime TIMESTAMP NOT NULL,
    Verified VARCHAR(10) NOT NULL,
    Password VARCHAR(50) NOT NULL,
    Phone INTEGER UNIQUE NOT NULL,
    BirthDate TIMESTAMP NOT NULL,
    Address VARCHAR(200) NOT NULL,
    UserType VARCHAR(20) NOT NULL,
    SelfIntroduction VARCHAR(500) NOT NULL,
    ProfilePicture VARCHAR(200) NOT NULL,
    Authority VARCHAR(100) NOT NULL
);


-- Insert fake data into MEMBER table
INSERT INTO MEMBER VALUES 
('user01', 'user01@example.com', '王小明', true, '2023-01-01 10:00:00', 'yes', 'password123', 1234567890, '1995-03-15 00:00:00', '台北市中正區', 'customer', '大家好，我是小明。', 'profile01.jpg', 'normal'),
('user02', 'user02@example.com', '李美麗', false, '2023-01-02 11:00:00', 'yes', 'password456', 1234567891, '1998-07-20 00:00:00', '高雄市左營區', 'seller', '我喜歡閱讀和旅行。', 'profile02.jpg', 'normal');

-- Create CUSTOMER table
CREATE TABLE CUSTOMER (
    CustomerID VARCHAR(20) PRIMARY KEY REFERENCES MEMBER(UserID)
);

-- Insert fake data into CUSTOMER table
INSERT INTO CUSTOMER (CustomerID) VALUES
('user01');

-- Create SELLER table
CREATE TABLE SELLER (
    SellerID VARCHAR(20) PRIMARY KEY REFERENCES MEMBER(UserID)
);

-- Insert fake data into SELLER table
INSERT INTO SELLER (SellerID) VALUES
('user02');

-- Create ADMINISTRATOR table
CREATE TABLE ADMINISTRATOR (
    AdministratorID VARCHAR(20) PRIMARY KEY REFERENCES MEMBER(UserID)
);

-- Insert fake data into ADMINISTRATOR table
INSERT INTO ADMINISTRATOR (AdministratorID) VALUES
('user01');

-- Create BOOK table
CREATE TABLE BOOK (
    BookID VARCHAR(20) PRIMARY KEY,
    SellerID VARCHAR(20) NOT NULL REFERENCES SELLER(SellerID),
    OrderID VARCHAR(20),
    DiscountCode VARCHAR(20),
    ISBN VARCHAR(20) UNIQUE NOT NULL,
    ShippingLocation VARCHAR(100) NOT NULL,
    ShippingMethod VARCHAR(50) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    BookPicture VARCHAR(200) NOT NULL,
    Condition VARCHAR(50) NOT NULL,
    Price INTEGER NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Category VARCHAR(50) NOT NULL
);

-- Insert fake data into BOOK table
INSERT INTO BOOK VALUES 
('book01', 'user02', null, null, '978-3-16-148410-0', '台北市', '郵寄', '哈利波特', 'book01.jpg', '新', 500, '這是一本關於魔法的書。', 'Fantasy'),
('book02', 'user02', null, null, '978-3-16-148411-7', '高雄市', '快遞', '小王子', 'book02.jpg', '二手', 300, '一本經典的兒童文學作品。', 'Children');


-- Create SHOPPING_CART table
CREATE TABLE SHOPPING_CART (
    ShoppingCartID VARCHAR(20) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL REFERENCES CUSTOMER(CustomerID)
);

-- Insert fake data into SHOPPING_CART table
INSERT INTO SHOPPING_CART (ShoppingCartID, CustomerID) VALUES
('cart01', 'user01');

-- Create ORDERS table
CREATE TABLE ORDERS (
    OrderID VARCHAR(20) PRIMARY KEY,
    SellerID VARCHAR(20) NOT NULL REFERENCES SELLER(SellerID),
    CustomerID VARCHAR(20) NOT NULL REFERENCES CUSTOMER(CustomerID),
    OrderStatus VARCHAR(50) NOT NULL,
    Time TIMESTAMP NOT NULL,
    TotalAmount INTEGER NOT NULL,
    TotalBookCount INTEGER NOT NULL,
    Comment VARCHAR(500) NOT NULL,
    Stars INT NOT NULL
);

-- Insert fake data into ORDER table
INSERT INTO ORDERS (OrderID, SellerID, CustomerID, OrderStatus, Time, TotalAmount, TotalBookCount, Comment, Stars) VALUES
('order01', 'user02', 'user01', 'Delivered', '2021-01-02 15:00:00', 400, 2, 'Great service!', 5);

-- Create DISCOUNT table
CREATE TABLE DISCOUNT (
    DiscountCode VARCHAR(20) PRIMARY KEY,
    SellerID VARCHAR(20) NOT NULL REFERENCES SELLER(SellerID),
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    DiscountRate FLOAT NOT NULL,
    TotalAmountForDiscount INTEGER NOT NULL,
    Applied BOOL NOT NULL
);

-- Insert fake data into DISCOUNT table
INSERT INTO DISCOUNT VALUES 
('discount01', 'user02', '暑期促銷', '百分比', '所有書籍9折', '2023-07-01 00:00:00', '2023-08-31 23:59:59', 0.9, 1000, false);

-- Create LIKE_LIST TABLE
CREATE TABLE LIKE_LIST (
    SellerID VARCHAR(20) REFERENCES SELLER(SellerID),
    CustomerID VARCHAR(20) REFERENCES CUSTOMER(CustomerID),
    PRIMARY KEY (SellerID, CustomerID)
);

-- Insert fake data into LIKE_LIST table
INSERT INTO LIKE_LIST (SellerID, CustomerID) VALUES
('user02', 'user01');

-- Create APPLIED_LIST TABLE
CREATE TABLE APPLIED_LIST (
    OrderID VARCHAR(20) REFERENCES ORDERS(OrderID),
    DiscountCode VARCHAR(20) REFERENCES DISCOUNT(DiscountCode),
    PRIMARY KEY (OrderID, DiscountCode)
);

-- Insert fake data into APPLIED_LIST table
INSERT INTO APPLIED_LIST (OrderID, DiscountCode) VALUES
('order01', 'discount01');

-- Create Cart_List TABLE
CREATE TABLE Cart_List (
    ShoppingCartID VARCHAR(20) NOT NULL REFERENCES SHOPPING_CART(ShoppingCartID),
    BookID VARCHAR(20) NOT NULL REFERENCES BOOK(BookID)
);

-- Insert fake data into Cart_List table
INSERT INTO Cart_List VALUES 
('cart01', 'book01'),
('cart01', 'book02');


-- Create SPECIALIZED TABLE
CREATE TABLE SPECIALIZED (
    DiscountCode VARCHAR(20) REFERENCES DISCOUNT(DiscountCode),
    BookID VARCHAR(20) REFERENCES BOOK(BookID),
    PRIMARY KEY (DiscountCode, BookID)
);

-- Insert fake data into SPECIALIZED table
INSERT INTO SPECIALIZED VALUES 
('discount01', 'book01');
