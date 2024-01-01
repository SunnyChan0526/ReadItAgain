"use client";
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { styled, alpha } from '@mui/material/styles';
import { AppBar, Box, Toolbar, IconButton, Typography, InputBase, MenuItem, Menu, Button, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
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

export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
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
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

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
      <MenuItem onClick={handleProfileMenuOpen}>
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
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };
    handleLoginStatus();
  }, [isLoggedIn]);
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
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
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
              <IconButton
                size="large"
                edge="end"
                aria-label="user's shoppingcart"
                style={{ color: "white" }}
              >
                <ShoppingCart />
              </IconButton>
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
        {renderMenu}
      </Box>
    </SnackbarProvider>
  );
}