'use client'
import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Avatar, Box, Breadcrumbs, Typography, Grid, Link, Divider, Stack, Card, CardActionArea, CardMedia, Skeleton, CardContent, Grow, Dialog, DialogTitle, DialogActions, DialogContent, TextField, InputAdornment, Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PrimarySearchAppBar from "../../appbar";

type SellerInfo = {
    seller_name: string;
    seller_avatar: string;
}

type Bookdetail = {
    sellerid: string,
    bookid: number,
    isbn: string,
    name: string,
    condition: string,
    price?: number,
    shippinglocation: string,
    description: string,
    category: string,
    bookpictures: Array<string>,
};

interface ApiResponse {
    sellerinfo: SellerInfo;
    bookinfo: Bookdetail;
}
function ReadItAgain({ params }: { params: { Bookid: string } }) {
    const [books, setBooks] = useState<Bookdetail>({
        sellerid: '',
        bookid: -1,
        isbn: '',
        name: '',
        condition: '',
        price: 0,
        shippinglocation: '',
        description: '',
        category: '',
        bookpictures: [''],
    });
    const [seller, setSeller] = useState<SellerInfo>({
        seller_name: '',
        seller_avatar: '',
    });

    const [parentState, setParentState] = React.useState(false);

    const handleImageClick = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
    };
    useEffect(() => {
        fetch(`/api/py/books/${params.Bookid}`)
            .then((response) => response.json() as Promise<ApiResponse>)
            .then((data) => {
                setSeller(data.sellerinfo);
                setBooks(data.bookinfo);
                setSelectedImage(data.bookinfo.bookpictures[0]);
            })
            .catch((error) => {
                console.error('Error fetching books:', error);
            });
    }, [params.Bookid]);
    const [selectedImage, setSelectedImage] = useState('');
    const handleAddCartClick = async (bookId: number) => {
        try {
            const response = await fetch(`/api/py/add-to-cart/${bookId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error adding item to cart, status ${response.status}`);
            }

            // Handle response data if necessary
            const data = await response.json();
            console.log('Item added to cart:', data);
            setParentState(!parentState);

        } catch (error) {
            console.error('Failed to add item to cart:', error);
        }
    };
    return (
        <main className="overflow-x-hidden min-h-screen bg-white flex flex-col">
            <PrimarySearchAppBar parentState={parentState}></PrimarySearchAppBar>
            <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }} className="px-24 mt-4">
                {/* 書本圖廊 */}
                <Grid item xs={12} sm={8} md={4}>
                    <Box sx={{ maxWidth: 345, margin: 'auto' }}>
                        <Card>
                            {
                                selectedImage ? (
                                    <CardMedia
                                        component="img"
                                        className="h-80"
                                        image={selectedImage ? "/api/py/img/book/" + selectedImage : ''}
                                        alt="Main Book Image"
                                    />
                                ) : (
                                    <Skeleton variant="rectangular" width={400} height={320} />
                                )
                            }
                        </Card>
                        <Grid container spacing={2} sx={{ marginTop: 2 }}>
                            {books.bookpictures.map((image, index) => (
                                <Grid item xs={4} key={index}>
                                    <CardActionArea onClick={() => image && handleImageClick(image)}>
                                        {
                                            image ? (
                                                <CardMedia
                                                    component="img"
                                                    height="100"
                                                    image={image ? "/api/py/img/book/" + image : ''}
                                                    alt={`Book Thumbnail ${index + 1}`}
                                                    sx={{
                                                        opacity: image === selectedImage ? 0.5 : 1,
                                                        border: image === selectedImage ? '2px solid #666' : 'none',
                                                        boxShadow: image === selectedImage ? '0px 0px 8px 2px rgba(102, 102, 102, 0.5)' : 'none',
                                                        backgroundColor: !image ? '#ddd' : 'inherit',
                                                    }}
                                                />
                                            ) : (
                                                <Skeleton variant="rectangular" width={100} height={100} />
                                            )
                                        }
                                    </CardActionArea>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>
                {/*右半邊container*/}
                <Grid item xs={12} sm={8} md={8}>
                    {/* 標題*/}
                    <Grid container item spacing={2} justifyContent="space-between" alignItems="flex-end">
                        <Grid item>
                            <Typography variant="h4" className="font-newsfont" gutterBottom>{books.name}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" className="font-newsfont" gutterBottom>{"ISBN " + books.isbn}</Typography>
                        </Grid>
                    </Grid>

                    {/* 分割線 */}
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    {/*頭像+賣家名稱+星星 */}
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-start"
                            alignItems="center" className="mt-4">
                            <Avatar
                                alt={seller.seller_name}
                                src={seller.seller_avatar ? "/api/py/img/avatar/" + seller.seller_avatar : ''}
                                className="h-9 w-9"
                            />
                            <Button href={"/Seller/" + books.sellerid} className='font-newsfont text-black text-2xl hover:bg-tan-200'>
                                {seller.seller_name}
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item className="min-[0px]:h-16 md:h-32"></Grid>
                    {/* 書本狀況+書本位置+書本分類 */}
                    <Grid container item justifyContent="flex-start">
                        <Breadcrumbs separator="‧" aria-label="breadcrumb">
                            <Typography variant="subtitle1" className="font-newsfont">{books.condition}</Typography>
                            <Typography variant="subtitle1" className="font-newsfont">{books.shippinglocation}</Typography>
                            <Typography variant="subtitle1" className="font-newsfont">{books.category}</Typography>
                        </Breadcrumbs>
                    </Grid>
                    {/*價格+購物車按鈕 */}
                    <Grid container item spacing={2} justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h5" className="font-newsfont">{"NT $" + books.price}</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" startIcon={<AddShoppingCartIcon></AddShoppingCartIcon>} className="bg-tan-500" onClick={() => handleAddCartClick(books.bookid)}>加入購物車</Button>
                        </Grid>
                    </Grid>

                    {/* 分割線 */}
                    <Grid item xs={12} className="mt-5">
                        <Divider />
                    </Grid>
                    {/*書本描述*/}
                    <Grid item xs={12} >
                        <Typography variant="h5" className="font-newsfont mt-2" gutterBottom>{books.description}</Typography>
                    </Grid>
                </Grid>
            </Grid>

        </main>
    );
}


export default ReadItAgain;