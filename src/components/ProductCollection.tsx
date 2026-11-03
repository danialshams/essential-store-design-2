"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {SlidersHorizontal,ChevronDown,X,Search,RotateCcw,ArrowLeft} from "lucide-react";
import {type Product,numberFa} from "@/lib/catalog";
import {useShop} from "@/components/ShopProvider";
import {ProductCard} from "@/components/ProductCard";
export function ProductCollection({category,initialProducts}:{category?:string;initialProducts?:Product[]}){
 const {store}=useShop(),categories=store.categories;
 const params=useSearchParams(),[localSearch,setLocalSearch]=useState(params.get("q")||"");
 const [selectedCategory,setSelectedCategory]=useState(category||params.get("category")||"");
 const [sort,setSort]=useState(params.get("sort")||"popular"),[onlyInStock,setOnlyInStock]=useState(false),[openFilters,setOpenFilters]=useState(false);
 const [maxPrice,setMaxPrice]=useState<number>(0);
 const products=initialProducts??store.products;
 useEffect(()=>setLocalSearch(params.get("q")||""),[params]);
 useEffect(()=>setSelectedCategory(category||params.get("category")||""),[category,params]);
 useEffect(()=>{document.body.style.overflow=openFilters?"hidden":"";return()=>{document.body.style.overflow=""}},[openFilters]);
 const list=useMemo(()=>{
  const q=localSearch.trim().toLocaleLowerCase("fa");
  const result=products.filter(p=>(!selectedCategory||p.category===selectedCategory)&&(!onlyInStock||p.inventory>0)&&(!maxPrice||p.price<=maxPrice)&&(!q||`${p.name} ${p.subtitle} ${p.categoryLabel} ${p.sku}`.toLocaleLowerCase("fa").includes(q)));
  return result.sort((a,b)=>sort==="cheap"?a.price-b.price:sort==="expensive"?b.price-a.price:sort==="new"?Number(Boolean(b.newArrival))-Number(Boolean(a.newArrival)):Number(Boolean(b.featured))-Number(Boolean(a.featured)));
 },[products,selectedCategory,onlyInStock,maxPrice,localSearch,sort]);
 function reset(){setSelectedCategory(category||"");setOnlyInStock(false);setMaxPrice(0);setLocalSearch("");setSort("popular")}
 const filters=<><div className="filter-group"><h3>دسته‌بندی محصولات</h3><div className="filter-categories"><button className={!selectedCategory?"selected":""} onClick={()=>setSelectedCategory("")}>همه محصولات</button>{categories.map(c=><button key={c.id} className={selectedCategory===c.id?"selected":""} onClick={()=>setSelectedCategory(c.id)}>{c.name}</button>)}</div></div><div className="filter-group"><h3>حداکثر قیمت</h3><div className="filter-price"><button className={!maxPrice?"selected":""} onClick={()=>setMaxPrice(0)}>همه قیمت‌ها</button><button className={maxPrice===2000000?"selected":""} onClick={()=>setMaxPrice(2000000)}>تا ۲ میلیون تومان</button><button className={maxPrice===3000000?"selected":""} onClick={()=>setMaxPrice(3000000)}>تا ۳ میلیون تومان</button></div></div><label className="filter-check"><input type="checkbox" checked={onlyInStock} onChange={e=>setOnlyInStock(e.target.checked)}/><span>فقط کالاهای موجود</span></label><button className="clear-filters" onClick={reset}>پاک کردن فیلترها <RotateCcw size={15}/></button></>;
 return <div className="container collection-layout">
 <div className="breadcrumbs"><Link href="/">خانه</Link><ArrowLeft size={14}/><span>{category?categories.find(c=>c.id===category)?.name||"محصولات":"همه محصولات"}</span></div>
 <header className="collection-heading"><div><span>{store.settings.storeName}</span><h1>{category?categories.find(c=>c.id===category)?.name:"همه محصولات"}</h1><p>محصول موردعلاقه‌ات رو از بین انتخاب‌های ما پیدا کن.</p></div><span className="collection-count">{numberFa(list.length)} محصول</span></header>
 <div className="category-pills" id="categories"><Link href="/products" className={!selectedCategory?"active":""}>همه</Link>{categories.map(c=><Link href={`/category/${c.id}`} className={selectedCategory===c.id?"active":""} key={c.id}>{c.name}</Link>)}</div>
 <div className="collection-body"><aside className="filter-sidebar"><h2><SlidersHorizontal size={19}/> فیلتر محصولات</h2>{filters}</aside><section className="collection-results"><div className="results-toolbar"><form role="search" className="collection-search" onSubmit={e=>e.preventDefault()}><Search size={18}/><input placeholder="جستجو در محصولات..." aria-label="جستجو در محصولات" value={localSearch} onChange={e=>setLocalSearch(e.target.value)}/></form><div className="results-actions"><button className="mobile-filter-trigger" onClick={()=>setOpenFilters(true)}><SlidersHorizontal size={18}/> فیلترها</button><label className="sort-picker">مرتب‌سازی <ChevronDown size={14}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="مرتب‌سازی محصولات"><option value="popular">محبوب‌ترین</option><option value="new">جدیدترین</option><option value="cheap">ارزان‌ترین</option><option value="expensive">گران‌ترین</option></select></label></div></div>
 {list.length?<div className="product-grid collection-grid">{list.map(p=><ProductCard product={p} key={p.id}/>)}</div>:<div className="collection-empty"><Search size={35}/><h2>محصولی پیدا نشد</h2><p>عبارت جستجو یا فیلترها رو تغییر بده.</p><button className="button button-outline" onClick={reset}>نمایش همه محصولات</button></div>}</section></div>
 {openFilters&&<div className="filter-overlay"><button className="filter-backdrop" aria-label="بستن فیلتر" onClick={()=>setOpenFilters(false)}/><aside className="filter-sheet"><div className="filter-sheet-head"><h2>فیلتر محصولات</h2><button aria-label="بستن" onClick={()=>setOpenFilters(false)}><X size={22}/></button></div><div className="filter-sheet-content">{filters}</div><div className="filter-sheet-bottom"><button className="button button-primary" onClick={()=>setOpenFilters(false)}>نمایش {numberFa(list.length)} محصول <ArrowLeft size={17}/></button></div></aside></div>}
 </div>}
