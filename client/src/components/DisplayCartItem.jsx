import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import imageEmpty from '../assets/empty_cart.webp';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';

const DisplayCartItem = ({ close }) => {
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
    const cartItem = useSelector(state => state.cartItem.cart);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    
    // AI Recipe State
    const [recipe, setAiRecipe] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect to Checkout
    const redirectToCheckoutPage = () => {
        if (user?._id) {
            navigate("/checkout");
            if (close) close();
            return;
        }
        toast("Please Login");
    };

    // Fetch AI Recipe from Backend
    const generateRecipe = async () => {
        try {
            setLoading(true);
            const response = await Axios.get("/api/cart/generate-recipe");
            console.log("API Response:", response.data);
            if (response.data.success) {
                setAiRecipe(response.data.suggestion || {dish: "Unknown Dish", requiredIngredients: []});
                setShowPopup(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Recipe API Error:", error);
            toast.error("Failed to generate recipe!");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
            <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto'>
                <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
                    <h2 className='font-semibold'>Cart</h2>
                    <button onClick={close}>
                        <IoClose size={25} />
                    </button>
                </div>

                <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
                    {cartItem[0] ? (
                        <>
                            <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
                                <p>Your total savings</p>
                                <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
                            </div>
                            <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
                                {cartItem.map((item) => (
                                    <div key={item?._id + "cartItemDisplay"} className='flex w-full gap-4'>
                                        <div className='w-16 h-16 bg-red-500 border rounded'>
                                            <img src={item?.productId?.image[0]} className='object-scale-down' />
                                        </div>
                                        <div className='w-full max-w-sm text-xs'>
                                            <p className='text-xs text-ellipsis line-clamp-2'>{item?.productId?.name}</p>
                                            <p className='text-neutral-400'>{item?.productId?.unit}</p>
                                            <p className='font-semibold'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}</p>
                                        </div>
                                        <div>
                                            <AddToCartButton data={item?.productId} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Generate Recipe Button */}
                            <button 
                                onClick={generateRecipe} 
                                className='w-full bg-green-600 text-white py-2 mt-4 rounded'
                            >
                                🍽️ Generate Recipe
                            </button>

                            <div className='bg-white p-4'>
                                <h3 className='font-semibold'>Bill details</h3>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Items total</p>
                                    <p className='flex items-center gap-2'>
                                        <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                        <span>{DisplayPriceInRupees(totalPrice)}</span>
                                    </p>
                                </div>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Quantity total</p>
                                    <p className='flex items-center gap-2'>{totalQty} item</p>
                                </div>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Delivery Charge</p>
                                    <p className='flex items-center gap-2'>Free</p>
                                </div>
                                <div className='font-semibold flex items-center justify-between gap-4'>
                                    <p>Grand total</p>
                                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='bg-white flex flex-col justify-center items-center'>
                            <img src={imageEmpty} className='w-full h-full object-scale-down' />
                            <Link onClick={close} to={"/"} className='block bg-green-600 px-4 py-2 text-white rounded'>Shop Now</Link>
                        </div>
                    )}
                </div>

                {cartItem[0] && (
                    <div className='p-2'>
                        <div className='bg-green-700 text-neutral-100 px-4 font-bold text-base py-4 rounded flex items-center gap-4 justify-between'>
                            <div>{DisplayPriceInRupees(totalPrice)}</div>
                            <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                                Proceed <FaCaretRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

             {/* AI Recipe Popup */}
             {showPopup && recipe && (
    <div className="fixed bottom-0 left-0 w-full h-[50vh] bg-white shadow-lg p-6 rounded-t-lg z-[10000] flex flex-col">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">🍽️ {recipe?.dish || "Recipe Name"}</h3>
            <button onClick={() => setShowPopup(false)} className="text-2xl">✖</button>
        </div>
        <div className="overflow-y-auto mt-3 flex-grow">
            <h4 className="font-semibold">Required Ingredients:</h4>
            <ul className="list-disc ml-5">
                {recipe?.requiredIngredients?.length > 0 ? (
                    recipe.requiredIngredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))
                ) : (
                    <p>No ingredients listed.</p>
                )}
            </ul>
            {recipe?.youtubeLink && (
                <a 
                    href={recipe.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mt-4 text-blue-600 underline"
                >
                    🎥 Watch Recipe on YouTube
                </a>
            )}
        </div>
    </div>
)}

        </section>
    );
};

export default DisplayCartItem;
