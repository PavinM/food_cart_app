import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { footerColumns, logoUrl, menuSections, restaurants } from './data';
import './styles.css';

const rootElement = document.getElementById('root');
const appRoot = window.__foodAppRoot || createRoot(rootElement);
window.__foodAppRoot = appRoot;

// Cart State Management Context
const CartContext = createContext();

function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    const addItem = (item) => {
        setItems(prev => {
            const existing = prev.find(i => i.card.info.id === item.card.info.id);
            if (existing) {
                return prev.map(i => i.card.info.id === item.card.info.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeItem = (item) => {
        setItems(prev => {
            const existing = prev.find(i => i.card.info.id === item.card.info.id);
            if (existing) {
                if (existing.quantity <= 1) {
                    return prev.filter(i => i.card.info.id !== item.card.info.id);
                }
                return prev.map(i => i.card.info.id === item.card.info.id ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev;
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

// Location Hook & Navigation Helper
function useLocationState() {
    const [locationState, setLocationState] = useState(() => ({
        pathname: window.location.pathname,
        search: window.location.search,
    }));

    useEffect(() => {
        const handlePopState = () => {
            setLocationState({ pathname: window.location.pathname, search: window.location.search });
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return locationState;
}

function navigate(url, replace = false) {
    if (replace) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
}

// AppLink to prevent standard anchor tag page-reload
function AppLink({ href, children, className = '', active = false, onClick }) {
    return (
        <a
            href={href}
            className={className}
            aria-current={active ? 'page' : undefined}
            onClick={(event) => {
                if (onClick) {
                    onClick(event);
                }
                if (event.defaultPrevented) {
                    return;
                }
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                    return;
                }
                event.preventDefault();
                navigate(href);
            }}
        >
            {children}
        </a>
    );
}

// Header Component
function Header({ activePath }) {
    const { items } = useContext(CartContext);
    const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    return (
        <header className="header">
            <AppLink href="/" className="logo-link">
                <img className="logo" src={logoUrl} alt="logo" />
            </AppLink>
            <div className="navItems">
                <ul>
                    <li>
                        <AppLink href="/" className={activePath === '/' ? 'active' : ''}>Home</AppLink>
                    </li>
                    <li>
                        <AppLink href="/help" className={activePath === '/help' ? 'active' : ''}>Help</AppLink>
                    </li>
                    <li>
                        <AppLink href="/search" className={activePath.startsWith('/search') ? 'active' : ''}>
                            Search
                            <svg className="searchIcon" viewBox="0 0 512 512" style={{ width: '14px', height: '14px', fill: 'currentColor', marginLeft: '4px', verticalAlign: 'middle' }}>
                                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                            </svg>
                        </AppLink>
                    </li>
                    <li>
                        <AppLink href="/cart" className={activePath === '/cart' ? 'active' : ''}>
                            Cart
                            <div className="cartIconContainer">
                                <svg className="cartIcon" viewBox="0 0 576 512" style={{ width: '16px', height: '16px', fill: 'currentColor', marginLeft: '4px', verticalAlign: 'middle' }}>
                                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                                </svg>
                                {cartCount > 0 && <span className="cartItemCount">{cartCount}</span>}
                            </div>
                        </AppLink>
                    </li>
                </ul>
            </div>
        </header>
    );
}

// Restaurant Card sub-component
function RestaurantCard({ resData, show }) {
    return (
        <div className="card" onClick={() => navigate(`/restaurant/${resData.id}`)}>
            <img alt="res" src={`https://food-web-ee3a0.firebaseapp.com/images/${resData.cloudinaryImageId}.avif`} onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/food.jpeg'; }} />
            <div className="cardData">
                <h3 className="cardResName">{resData.name}</h3>
                {show && (
                    <>
                        <div className="cardResCuisines">{resData.cuisines.join(', ')}</div>
                        <div className="cardResPrice">{resData.costForTwo}</div>
                        <div className="cardResInfo">
                            <span className="cardResRating">{resData.avgRating} Rating</span>
                            <span className="cardResTime">3.2 mins</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Carousel Component
function CarouselScroller() {
    const containerRef = useRef(null);

    const scrollLeft = () => {
        if (containerRef.current) {
            const slideWidth = containerRef.current.querySelector('.slide')?.clientWidth || 200;
            containerRef.current.scrollLeft -= slideWidth;
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            const slideWidth = containerRef.current.querySelector('.slide')?.clientWidth || 200;
            containerRef.current.scrollLeft += slideWidth;
        }
    };

    return (
        <div className="carousel">
            <div className="carouselContainer">
                <h2>Top restaurant chains in Noida</h2>
                <div className="slideContainer">
                    <button className="slideArrow" onClick={scrollLeft}>
                        <img src="https://food-web-ee3a0.firebaseapp.com/images/left.png" alt="." />
                    </button>
                    <button className="slideArrow" onClick={scrollRight}>
                        <img src="https://food-web-ee3a0.firebaseapp.com/images/right.png" alt="." />
                    </button>
                </div>
            </div>
            <section className="sliderWrapper">
                <ul className="slidesContainer" ref={containerRef}>
                    {restaurants.map(item => (
                        <li className="slide" key={item.info.id}>
                            <RestaurantCard show={false} resData={item.info} />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

// Home Page Component
function HomePage() {
    return (
        <div className="homePageContainer">
            <CarouselScroller />
            <h2>Restaurants with online food delivery in Noida</h2>
            <div className="cardContainer">
                {restaurants.map(item => (
                    <RestaurantCard key={item.info.id} show={true} resData={item.info} />
                ))}
            </div>
        </div>
    );
}

// Search Page Component
function SearchPage() {
    const [query, setQuery] = useState('');
    const [showPopular, setShowPopular] = useState(true);
    const [filteredRes, setFilteredRes] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('query') || '';
        setQuery(q);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmed = query.trim();
            setShowPopular(trimmed === '');

            const url = trimmed ? `/search?query=${encodeURIComponent(trimmed)}` : '/search';
            navigate(url, true);

            if (trimmed !== '') {
                const matches = restaurants.filter(item =>
                    item.info.name.toLowerCase().includes(trimmed.toLowerCase())
                );
                setFilteredRes(matches);
            } else {
                setFilteredRes([]);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    const handlePopularClick = (name) => {
        setQuery(name);
    };

    return (
        <div className="search">
            <div className="searchContainer">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="searchField"
                    placeholder="Search Restaurants and Food"
                />
                <svg className="searchIcon" viewBox="0 0 512 512" style={{ width: '14px', height: '14px', fill: '#686b78', cursor: 'pointer' }}>
                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                </svg>
            </div>

            {showPopular && (
                <>
                    <h3 className="heading">Popular Restaurants</h3>
                    <div className="searCuisineContainer">
                        {restaurants.slice(0, 8).map(item => (
                            <div className="cuisineContainer" key={item.info.id} onClick={() => handlePopularClick(item.info.name)}>
                                <img src={`https://food-web-ee3a0.firebaseapp.com/images/${item.info.cloudinaryImageId}.avif`} alt={item.info.name} onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/food.jpeg'; }} />
                                <p>{item.info.name}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!showPopular && (
                <div className="searched">
                    {filteredRes.length > 0 ? (
                        filteredRes.map(item => (
                            <div className="searchedData" key={item.info.id} onClick={() => navigate(`/restaurant/${item.info.id}`)}>
                                <img src={`https://food-web-ee3a0.firebaseapp.com/images/${item.info.cloudinaryImageId}.avif`} alt={item.info.name} onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/food.jpeg'; }} />
                                <div>
                                    <p>{item.info.name}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="searchNotFound">
                            <p>This restaurant is not listed</p>
                            <p>Please enter some Other Restaurant Name</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Restaurant Detail Page Component
function RestaurantDetailPage({ resId }) {
    const { items, addItem, removeItem } = useContext(CartContext);
    const res = restaurants.find(r => r.info.id === resId) || restaurants[0];

    const [activeCategory, setActiveCategory] = useState(menuSections[0]?.card?.card?.title || '');

    const handleCategoryClick = (title) => {
        setActiveCategory(prev => prev === title ? null : title);
    };

    return (
        <div className="restPage">
            <p className="path">Home / Noida / {res.info.name}</p>

            <div className="restContainerfood">
                <div className="restInfo">
                    <p>{res.info.name}</p>
                </div>

                <div className="restaurantInfo">
                    <div className="restaurantInfoContainer">
                        <div className="primary">
                            <p>Uh-oh! Outlet is not accepting orders at the moment. They should be back by 11:00 AM tomorrow</p>
                        </div>
                        <div className="secondary">
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>
                                    {res.info.avgRating} ({res.info.totalRatingsString || '100+ ratings'})
                                </p>
                                <p style={{ color: 'grey' }}>•</p>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>{res.info.costForTwo}</p>
                            </div>
                            <p style={{ color: '#f15700', textDecoration: 'underline', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                                {res.info.cuisines.join(', ')}
                            </p>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 700 }}>Outlet</p>
                                <p style={{ color: 'grey', fontSize: '14px' }}>{res.info.areaName}</p>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Closed & not delivering</span>
                        </div>
                    </div>
                </div>

                <div className="restaurantService">
                    <p>Order Online</p>
                    <p style={{ borderBottom: 'none' }}>Dineout</p>
                </div>

                <div className="restcuisineCont">
                    {menuSections.map(category => {
                        const title = category.card.card.title;
                        const itemCards = category.card.card.itemCards || [];
                        const isOpen = activeCategory === title;

                        return (
                            <div className="menuContainer" key={title}>
                                <div className="menuItemsCont" style={{ borderBottom: isOpen ? 'none' : '8px solid #d3d3d3', cursor: 'pointer', paddingBottom: '15px' }} onClick={() => handleCategoryClick(title)}>
                                    <h3 className="foodCat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{title} ({itemCards.length})</span>
                                        <img src={isOpen ? 'https://food-web-ee3a0.firebaseapp.com/images/up-arrow.png' : 'https://food-web-ee3a0.firebaseapp.com/images/down-arrow.png'} alt="arrow" style={{ width: '15px', height: '15px' }} />
                                    </h3>
                                </div>

                                {isOpen && (
                                    <div style={{ borderBottom: '8px solid #d3d3d3', paddingBottom: '30px' }}>
                                        {itemCards.map(item => {
                                            const info = item.card.info;
                                            const cartItem = items.find(i => i.card.info.id === info.id);
                                            const priceVal = (info.defaultPrice || info.price) / 100;
                                            const imgSrc = info.imgName ? `https://food-web-ee3a0.firebaseapp.com/images/${info.imgName}` : 'https://food-web-ee3a0.firebaseapp.com/images/food.jpeg';

                                            return (
                                                <div className="menuFoodCard" key={info.id}>
                                                    <div className="menuFoodCardInfo">
                                                        <p className="cuisineName">{info.name}</p>
                                                        <p className="cuisinePrice">₹ {priceVal}</p>
                                                        <p className="cuisineDesc" title={info.description}>{info.description}</p>
                                                    </div>
                                                    <div className="menuFoodCardImageInfo">
                                                        <img src={imgSrc} alt={info.name} onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/food.jpeg'; }} />
                                                        {cartItem ? (
                                                            <div className="fgfg">
                                                                <button onClick={() => removeItem(item)}>-</button>
                                                                <span>{cartItem.quantity}</span>
                                                                <button onClick={() => addItem(item)}>+</button>
                                                            </div>
                                                        ) : (
                                                            <div className="addItems" onClick={() => addItem(item)}>
                                                                ADD
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Cart Page Component
function CartPage() {
    const { items, addItem, removeItem } = useContext(CartContext);

    const totalPrice = useMemo(() => {
        let total = 0;
        items.forEach(item => {
            const price = (item.card.info.defaultPrice || item.card.info.price) / 100;
            total += item.quantity * price;
        });
        return total;
    }, [items]);

    const handlePayment = () => {
        const config = {
            key: "rzp_test_hTBBwZ1lIKgkiA",
            key_secret: "0kvBX77hIOfMCE5L4VVG3VOc",
            amount: parseInt(totalPrice * 100),
            currency: "INR",
            order_receipt: "order_rcptid_",
            name: "E-Bharat",
            description: "for testing purpose",
            handler: function (response) {
                console.log(response);
            },
            theme: { color: "#3399cc" }
        };
        if (window.Razorpay) {
            new window.Razorpay(config).open();
        } else {
            console.error("Razorpay SDK not loaded");
        }
    };

    if (items.length === 0) {
        return (
            <div className="cart">
                <div className="emptyCart">
                    <img src="https://food-web-ee3a0.firebaseapp.com/images/Cart_empty.png" alt="Empty Cart" onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/Cart_empty.png'; }} />
                    <p>Your Cart is empty</p>
                    <span>You can go to home page to view more restaurants</span>
                    <button onClick={() => navigate('/')}>See restaurants near you</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart">
            <div className="cartItems">
                <div className="accountContainer">
                    <div className="timeline"></div>
                    <div className="accountItems">
                        <div className="accountSection">
                            <h3>Account</h3>
                            <p>To place your order now, log in to your existing account or sign up</p>
                            <div>
                                <div>
                                    <p style={{ cursor: 'pointer' }}>Have an Account</p>
                                    <p style={{ fontSize: '14px', fontWeight: 700 }}>LOG IN</p>
                                </div>
                                <div style={{ backgroundColor: '#60b246', color: '#fff', cursor: 'pointer' }}>
                                    <p>New To Food Web?</p>
                                    <p style={{ fontSize: '14px', fontWeight: 700 }}>SIGN UP</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <img src="https://food-web-ee3a0.firebaseapp.com/images/ROLL.avif" alt="Roll" onError={(e) => { e.target.src = 'https://food-web-ee3a0.firebaseapp.com/images/ROLL.avif'; }} />
                        </div>
                    </div>

                    <div className="accountItems">
                        <div className="accountSection">
                            <h3>Delivery Address</h3>
                        </div>
                    </div>

                    <div className="accountItems">
                        <div className="accountSection">
                            <h3>Payment</h3>
                            <p>To place your order now, log in to your existing account or sign up</p>
                            <div>
                                <button onClick={handlePayment}>Pay Now</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cartInfo">
                    <div className="cartInfoContainer">
                        <div className="amountHeading">
                            <h3>Items in Cart</h3>
                        </div>
                        <div className="scrollableContent">
                            {items.map(item => {
                                const info = item.card.info;
                                const priceVal = (info.defaultPrice || info.price) / 100;
                                return (
                                    <div className="addedItems" key={info.id}>
                                        <p>{info.name}</p>
                                        <div className="buttonCont">
                                            <button onClick={() => removeItem(item)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => addItem(item)}>+</button>
                                        </div>
                                        <span>₹ {priceVal}</span>
                                    </div>
                                );
                            })}

                            <div className="billDetails">
                                <h3>Bill details</h3>
                                <div>
                                    <p>Item Total</p>
                                    <p>₹ {totalPrice}</p>
                                </div>
                                <div>
                                    <p>Delivery Fee | 3.0 kms</p>
                                    <p>₹ 43</p>
                                </div>
                                <div>
                                    <p>Platform fee</p>
                                    <p>₹ 5</p>
                                </div>
                                <div>
                                    <p>GST and Restaurant Charges</p>
                                    <p>₹ 79</p>
                                </div>
                            </div>
                        </div>
                        <div className="amount">
                            <p>TO PAY</p>
                            <p>₹ {totalPrice}</p>
                        </div>
                    </div>

                    <div className="policy">
                        <div>
                            <h4>Review your order and address details to avoid cancellations</h4>
                            <p><span>Note: </span>If you cancel within 60 seconds of placing your order, a 100% refund will be issued. No refund for cancellations made after 60 seconds.</p>
                            <p>Avoid cancellation as it leads to food wastage.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Help Page Component
const faqsList = [
    { title: "I want to partner my restaurant with Food", data: "I want to partner my restaurant with Food" },
    { title: "What are the mandatory documents needed to list my restaurant on Swiggy?", data: "I want to partner my restaurant with Food" },
    { title: "I want to opt-out from Google reserve", data: "I want to partner my restaurant with Food" },
    { title: "After I submit all documents, how long will it take for my restaurant to go live on Swiggy?", data: "I want to partner my restaurant with Food" },
    { title: "What is this one time Onboarding fees? Do I have to pay for it while registering?", data: "I want to partner my restaurant with Food" }
];

function HelpPage() {
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (title) => {
        setActiveFaq(prev => prev === title ? null : title);
    };

    return (
        <div className="helpContainer">
            <h1>Help & Support</h1>
            <p>Let's take a step ahead and help you better.</p>
            <div className="questionContainer">
                <div className="questionInnerContainer">
                    <h1>Partner Onboarding</h1>
                    {faqsList.map(faq => {
                        const isOpen = activeFaq === faq.title;
                        return (
                            <div className="question" key={faq.title}>
                                <div className="answer">
                                    <div className="answerInfo">
                                        <p>{faq.title}</p>
                                        <img
                                            src={isOpen ? 'https://food-web-ee3a0.firebaseapp.com/images/up-arrow.png' : 'https://food-web-ee3a0.firebaseapp.com/images/down-arrow.png'}
                                            onClick={() => toggleFaq(faq.title)}
                                            alt="Toggle"
                                            style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                                        />
                                    </div>
                                </div>
                                {isOpen && (
                                    <p style={{ marginTop: '20px' }}>{faq.data}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Checkout Page Component (triggers payment on load)
function CheckoutPage() {
    useEffect(() => {
        const config = {
            key: "rzp_test_hTBBwZ1lIKgkiA",
            key_secret: "0kvBX77hIOfMCE5L4VVG3VOc",
            amount: 50000,
            currency: "INR",
            order_receipt: "order_rcptid_",
            name: "E-Bharat",
            description: "for testing purpose",
            handler: function (response) {
                console.log(response);
            },
            theme: { color: "#3399cc" }
        };
        if (window.Razorpay) {
            new window.Razorpay(config).open();
        } else {
            console.error("Razorpay SDK not loaded");
        }
    }, []);

    return (
        <section className="cartSection mb-5 checkoutPage" style={{ padding: '150px 0', textAlign: 'center' }}>
            <h1>ddvdv</h1>
        </section>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="footer">
            {footerColumns.map((col) => (
                <div key={col.title}>
                    <ul>
                        <li>{col.title}</li>
                        {col.items.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </footer>
    );
}

// App Wrapper Shell
function App() {
    const { pathname } = useLocationState();
    const route = pathname.replace(/\/$/, '') || '/';

    useEffect(() => {
        document.title = 'Food App';
    }, []);

    let page = <HomePage />;
    if (route.startsWith('/search')) {
        page = <SearchPage />;
    } else if (route.startsWith('/restaurant/')) {
        const resId = route.replace('/restaurant/', '');
        page = <RestaurantDetailPage resId={resId} />;
    } else if (route === '/help') {
        page = <HelpPage />;
    } else if (route === '/cart') {
        page = <CartPage />;
    } else if (route === '/checkout') {
        page = <CheckoutPage />;
    }

    return (
        <CartProvider>
            <Header activePath={route} />
            {page}
            <Footer />
        </CartProvider>
    );
}

appRoot.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
