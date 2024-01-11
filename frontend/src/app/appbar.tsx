"use client";
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { styled, alpha } from '@mui/material/styles';
import { AppBar, Box, Drawer, Toolbar, IconButton, Typography, InputBase, MenuItem, Menu, Button, Link, Popover, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Chip, Divider, Grid, Icon } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { AccountCircle, ShoppingCart, Logout, Storefront } from '@mui/icons-material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '50ch',
    },
    '&:focus': {
      width: '60ch',
    },
  },
}));

type Book = {
  bookid: number;
  name: string;
  picturepath: string;
  price: number;
  condition: string;
  shipping: string;
};

type SellerInfo = {
  sellerId: number;
  sellerName: string;
  totalPrice: number;
  totalBooks: number;
  shippingInfo: string[];
  books: Book[];
};

interface ChildComponentProps {
  parentState?: boolean; 
}

export default function PrimarySearchAppBar({ parentState }:ChildComponentProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [cartChanged, setCartChanged] = React.useState(false);
  const [sellers, setSellers] = React.useState<SellerInfo[]>([]);
  const [popoverZindex, setZindex] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  // 處理搜尋輸入變化
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 處理按鍵事件
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchTerm.length < 3) {
        enqueueSnackbar("搜尋請至少有3個字.", { variant: 'error' });
        return;
      }
      performSearch();
    }
  };
  const searchParams = useSearchParams()!

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  // 執行搜索
  const performSearch = () => {
    router.push('/Search?' + createQueryString('name', searchTerm));
  };
  const handleShoppingPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setZindex('z-[1100]');
  };
  const handleShoppingPopoverOpeninside = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setZindex('auto');
  };
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedSellerIndex, setSelectedSellerIndex] = React.useState<number | null>(null);
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  const handleListItemClick = (index: number) => {
    setSelectedSellerIndex(index);
    setDrawerOpen(true);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const popoverId = open ? 'primary-shopping-popover' : undefined;
  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="user's shoppingcart"
          color="inherit"
        >
          <ShoppingCart />
        </IconButton>
        <p>ShoppingCart</p>
      </MenuItem>
    </Menu>
  );
  const renderShoppingCartpopover = (
    <Popover
      id={popoverId}
      open={open}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      className={popoverZindex}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {
        sellers.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.primary">
            沒有購物車.
          </Typography>) : (
          <List sx={{ minWidth: 360, bgcolor: 'background.paper' }}>
            {sellers.map((seller, index) => (
              <ListItemButton key={index}
                onClick={() => handleListItemClick(index)}>
                <ListItemAvatar>
                  <Avatar
                    alt={seller.sellerName}
                    className='bg-tan-400 h-12 w-12'
                  >
                    {seller.sellerName[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={seller.sellerName}
                  secondary={
                    <>
                      <Typography component='span' variant="body2" color="text.primary" className='block'>
                        小計: ${seller.totalPrice}
                      </Typography>
                      <Typography component='span' variant="body2" color="text.secondary" className='block'>
                        書本地點: {seller.shippingInfo[0]}
                      </Typography>
                    </>
                  } />
                <Avatar className='bg-black h-5 w-5 text-[14px]'>{seller.totalBooks}</Avatar>
                <ArrowForwardIosIcon></ArrowForwardIosIcon>
              </ListItemButton>
            ))}
          </List>)
      }

    </Popover>
  );
  const renderShoppingBooksDrawer = (
    <Drawer
      anchor='right'
      open={drawerOpen}
      onClose={() => {
        setDrawerOpen(false);
        setSelectedSellerIndex(null);
      }}
    >
      {selectedSellerIndex !== null && (
        <Box
          sx={{ width: 460 }}
          role="presentation"
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <IconButton
                size="large"
                edge="end"
                onClick={toggleDrawer(false)}
                style={{ color: "black" }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                size="large"
                edge="start"
                aria-label="user's shoppingcart"
                style={{ color: "black" }}
                aria-controls={popoverId}
                onClick={isLoggedIn ? handleShoppingPopoverOpeninside : undefined}
                href={isLoggedIn ? '' : '/Login-Signup'}
              >
                <ShoppingCart />
              </IconButton>
            </Grid>
          </Grid>
          <Typography variant="h4" component="div" className='px-4 font-bold font-newsfont text-[32px]'>
            {sellers[selectedSellerIndex].sellerName}
          </Typography>
          <Typography variant="subtitle1" component="div" className='px-4 text-grey-500'>
            {'書本地點 : ' + sellers[selectedSellerIndex].shippingInfo[0]}
          </Typography>
          <Grid container justifyContent="space-between" alignItems="center" className='px-4 pt-5 pb-2'>
            <Grid item>
              <Typography variant="subtitle1" component="div" className='font-medium'>
                {sellers[selectedSellerIndex].totalBooks + " 本書本"}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" component="span" className='font-normal'>
                小計:$
              </Typography>
              <Typography variant="subtitle1" component="span" className='font-medium'>
                {sellers[selectedSellerIndex].totalPrice}
              </Typography>
            </Grid>
          </Grid>
          <Divider />
          <List>
            {sellers[selectedSellerIndex].books.map((book, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar
                    alt={book.name}
                    src={'/api/py/img/book/' + book.picturepath}
                  />
                </ListItemAvatar>
                <ListItemText primary={book.name} secondary={book.condition} />
                <Chip icon={<DeleteOutlineIcon></DeleteOutlineIcon>} label="移除" onClick={() => handleDeleteCartClick(book.bookid)}></Chip>
                <Typography variant="subtitle1" component="div" className='text-neutral-500 pl-1'>
                  {'$' + book.price}
                </Typography>
              </ListItem>
            ))}
            <Divider />
          </List>
          <Grid container justifyContent="space-between" alignItems="center" className='p-4'>
            <Grid item>
              <Typography variant="h6" component="div" className='font-bold'>
                小計
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6" component="div" className='font-bold'>
                {sellers[selectedSellerIndex].totalPrice}
              </Typography>
            </Grid>
          </Grid>
          <Grid container direction="column" justifyContent="center" alignItems="stretch" spacing={2} className='p-5 '>
            <Grid item>
              <Button variant='contained' className='text-center w-full bg-tan-500 text-white text-lg py-2' href={'/Checkout/'+sellers[selectedSellerIndex].sellerId}>前往結帳</Button>
            </Grid>
            <Grid item>
              <Button variant='outlined' className='text-center w-full text-lg py-2' href={'/Seller/'+sellers[selectedSellerIndex].sellerId}>新增更多書本</Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Drawer>
  );
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Logged out:', data.message);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  React.useEffect(() => {
    const handleLoginStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.isLoggedIn === true) {
          console.log('User is logged in');
          setIsLoggedIn(true);
        } else {
          console.log('User is not logged in');
          setIsLoggedIn(false);
          setSellers([]);
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
    handleLoginStatus();
    if (isLoggedIn) {
      fetch('/api/py/show-cart/seller', { credentials: 'include' })
        .then((response) => response.json())
        .then(async (data) => {
          const sellerInfoPromises = data.seller_id_list.map(async (sellerId: number, index: number) => {
            // 使用seller_id獲取書本資訊
            const booksResponse = await fetch(`/api/py/show-cart/books?seller_id=${sellerId}`, { credentials: 'include' });
            const booksData: Book[] = await booksResponse.json();

            // 計算書本價格總和
            const totalPrice = booksData.reduce((sum: number, book: Book) => sum + book.price, 0);
            const shippingInfo = booksData.map(book => book.shipping);
            return {
              sellerId,
              sellerName: data.seller_name_list[index],
              totalPrice,
              totalBooks: booksData.length,
              shippingInfo,
              books: booksData,
            };
          });

          const sellersInfo = await Promise.all(sellerInfoPromises);
          setSellers(sellersInfo); // 更新狀態
        })
        .catch((error) => console.error('Error fetching seller info:', error));
    }
  }, [isLoggedIn,cartChanged,anchorEl,parentState]);
  const handleDeleteCartClick = async (bookId: number) => {
    try {
      const response = await fetch(`/api/py/remove-from-cart/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error removing item from cart');
      }
      
      setCartChanged(!cartChanged);
      setSellers((prevSellers) => {
        if (typeof selectedSellerIndex === 'number') {
          const newSellers = [...prevSellers];
          const updatedBooks = newSellers[selectedSellerIndex].books.filter((book) => book.bookid !== bookId);
  
          newSellers[selectedSellerIndex] = {
            ...newSellers[selectedSellerIndex],
            books: updatedBooks,
            totalBooks: updatedBooks.length,
            totalPrice: updatedBooks.reduce((sum, book) => sum + book.price, 0),
          };
  
          if (updatedBooks.length === 0) {
            setDrawerOpen(false);
            setSelectedSellerIndex(null); 
          }
  
          return newSellers;
        }
        return prevSellers;
      });
    } catch (error) {
      console.error('Failed to delete item from cart:', error);
    }
  };
  return (
    <SnackbarProvider
      autoHideDuration={1000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Link
              variant="h5"
              href="/"
              underline='none'
              className='font-logofont text-white pb-1'
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Read it Again
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: "white" }} />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search for books…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
              />
            </Search>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                href='/MyPage'
                style={{ color: "white" }}
              >
                <AccountCircle />
              </IconButton>
              {isLoggedIn ? (
                <>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="seller's center"
                    style={{ color: "white" }}
                    href='/Seller-center'
                  >
                    <Storefront />
                  </IconButton>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="logout-button"
                    style={{ color: "white" }}
                    onClick={handleLogout}
                  >
                    <Logout />
                  </IconButton>
                </>
              ) : (
                <Button
                  className='text-white text-center'
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  href='/Login-Signup'
                >
                  Login / Sign up
                </Button>
              )}
              {
                sellers.length === 0 ? (
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="user's shoppingcart"
                    style={{ color: "white" }}
                    aria-controls={popoverId}
                    onClick={isLoggedIn ? handleShoppingPopoverOpen : undefined}
                    href={isLoggedIn ? '' : '/Login-Signup'}
                  >
                    <ShoppingCart />
                  </IconButton>
                ) : (
                  <Chip
                    icon={<ShoppingCart style={{ color: "white" }} />}
                    label={`${sellers.length} 台購物車`}
                    deleteIcon={<ExpandMoreIcon />}
                    className='mt-2 ml-3 text-white p-2 text-[16px]'
                    onClick={handleShoppingPopoverOpen}
                    onDelete={handleShoppingPopoverOpen}
                  />
                )
              }
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
        {renderShoppingCartpopover}
        {renderShoppingBooksDrawer}
      </Box>
    </SnackbarProvider>
  );
}