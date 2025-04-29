import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { categories } from "@/config/categories";
import { useCallback } from "react";

export default function Header() {
  // 로고 클릭 이벤트 핸들러
  const handleLogoClick = useCallback(() => {
    console.log('🖱️ Header: 로고 클릭 - 홈으로 이동');
  }, []);

  // Contact 버튼 클릭 이벤트 핸들러
  const handleContactClick = useCallback(() => {
    console.log('🖱️ Header: Contact 버튼 클릭');
  }, []);

  // 모바일 메뉴 토글 이벤트 핸들러
  const handleMenuToggle = useCallback(() => {
    console.log('🖱️ Header: 모바일 메뉴 토글');
  }, []);

  // 카테고리 클릭 이벤트 핸들러
  const handleCategoryClick = useCallback((categoryId: string, categoryLabel: string) => {
    console.log(`🖱️ Header: 카테고리 클릭 - ${categoryLabel} (${categoryId})`);
  }, []);

  // 페이지 링크 클릭 이벤트 핸들러
  const handlePageClick = useCallback((pageName: string) => {
    console.log(`🖱️ Header: 페이지 링크 클릭 - ${pageName}`);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex-1">
          <Link href="/" className="inline-block" onClick={handleLogoClick} aria-label="홈페이지로 이동">
            <h1 className="font-display font-bold gradient-text text-left">
              <span className="hidden sm:inline text-3xl">류이코노미 (RyuEcomomy)</span>
              <span className="sm:hidden text-xl">류이코노미</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="font-display font-medium border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Link href="/contact" onClick={handleContactClick}>Contact</Link>
          </Button>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleMenuToggle} aria-label="메뉴 열기">
                  <Bars3Icon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-xs">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-display text-left text-xl">
                    류이코노미
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">카테고리</h3>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <SheetClose key={category.id} asChild>
                        <Link
                          href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                          className="flex items-center gap-2 px-2 py-2.5 text-sm rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => handleCategoryClick(category.id, category.label)}
                        >
                          <span className="p-1.5 rounded-md" aria-hidden="true"
                            style={{ 
                              backgroundColor: `${category.color}15`,
                            }}
                          >
                            <category.icon className="h-4 w-4" style={{ color: category.color }} />
                          </span>
                          <span>{category.label}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">페이지</h3>
                  <nav className="space-y-1">
                    <SheetClose asChild>
                      <Link
                        href="/archive"
                        className="flex items-center gap-2 px-2 py-2.5 text-sm rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => handlePageClick('아카이브')}
                      >
                        <span>아카이브</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/contact"
                        className="flex items-center gap-2 px-2 py-2.5 text-sm rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => handlePageClick('연락하기')}
                      >
                        <span>연락하기</span>
                      </Link>
                    </SheetClose>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 