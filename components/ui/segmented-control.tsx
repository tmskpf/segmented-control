"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SegmentedControlProps {
  tabs: string[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
}

export function SegmentedControl({
  tabs,
  defaultTab,
  onChange,
}: SegmentedControlProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]);
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const tabsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // Calculate and store tab positions
  const updateTabPositions = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    tabsRef.current.forEach((tabElement, tabName) => {
      const tabRect = tabElement.getBoundingClientRect();
      const width = tabRect.width;
      const left = tabRect.left - containerRect.left;
      
      // Store positions as data attributes on the container
      containerRef.current?.style.setProperty(`--${tabName.replace(/\s+/g, '-')}-width`, `${width}px`);
      containerRef.current?.style.setProperty(`--${tabName.replace(/\s+/g, '-')}-left`, `${left}px`);
    });
    
    // Set the active tab position
    if (tabsRef.current.has(activeTab)) {
      const tabElement = tabsRef.current.get(activeTab);
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect();
        const width = tabRect.width;
        const left = tabRect.left - containerRect.left;
        
        containerRef.current.style.setProperty('--highlight-width', `${width}px`);
        containerRef.current.style.setProperty('--highlight-left', `${left}px`);
        
        // If we have a previous tab, set its position for animation
        if (previousTab && tabsRef.current.has(previousTab) && !isInitialMount.current) {
          const prevTabElement = tabsRef.current.get(previousTab);
          if (prevTabElement) {
            const prevTabRect = prevTabElement.getBoundingClientRect();
            const prevWidth = prevTabRect.width;
            const prevLeft = prevTabRect.left - containerRect.left;
            
            containerRef.current.style.setProperty('--prev-highlight-width', `${prevWidth}px`);
            containerRef.current.style.setProperty('--prev-highlight-left', `${prevLeft}px`);
            
            // Set animation flag
            containerRef.current.setAttribute('data-animating', 'true');
            
            // Remove animation flag after animation completes
            setTimeout(() => {
              containerRef.current?.removeAttribute('data-animating');
            }, 300); // Match this with the CSS animation duration
          }
        }
      }
    }
  }, [activeTab, previousTab]);

  // Update positions on mount and when tabs change
  useLayoutEffect(() => {
    updateTabPositions();
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    
    // Set up resize observer to handle dimension changes
    const resizeObserver = new ResizeObserver(() => {
      updateTabPositions();
    });
    
    // Observe the container and all tab elements
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    tabsRef.current.forEach((element) => {
      if (element) {
        resizeObserver.observe(element);
      }
    });
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [tabs, activeTab, updateTabPositions]);

  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(tab);
      onChange?.(tab);
    }
  };

  const handleTabMouseDown = (tab: string) => {
    setPressedTab(tab);
  };

  const handleTabMouseUp = () => {
    setPressedTab(null);
  };

  const handleTabMouseLeave = () => {
    setPressedTab(null);
  };

  return (
    <div className="h-8 p-0.5 rounded-lg bg-zinc-100 border border-[#18181B]/[0.02] border-[0.5px] relative inline-flex">
      <style jsx>{`
        .container[data-animating="true"] .highlight {
          animation: moveHighlight 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards; /* Slightly more pronounced spring effect */
        }
        
        @keyframes moveHighlight {
          0% {
            transform: translateX(var(--prev-highlight-left));
            width: var(--prev-highlight-width);
          }
          100% {
            transform: translateX(var(--highlight-left));
            width: var(--highlight-width);
          }
        }
      `}</style>
      
      <div 
        className="flex h-full relative container" 
        ref={containerRef}
      >
        {/* Active tab background - controlled by CSS animations */}
        <div 
          className="absolute top-0 h-full bg-white rounded-md shadow-[0_0.5px_1px_0_rgba(0,0,0,0.1)] z-0 highlight"
          style={{ 
            width: 'var(--highlight-width, 0)',
            transform: 'translateX(var(--highlight-left, 0))'
          }}
        />
        
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;
          const showDivider = !isActive && index > 0 && activeTab !== tabs[index - 1];
          const showChevron = isActive && tab !== "All";
          const isPressed = pressedTab === tab;
          
          return (
            <div 
              key={tab} 
              className="relative z-10 flex items-center"
              ref={(el) => {
                if (el) tabsRef.current.set(tab, el);
              }}
            >
              {/* Divider line */}
              {showDivider && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[1px] h-3.5 bg-zinc-200" />
              )}
              
              {/* Tab button */}
              <button
                className={cn(
                  "h-full rounded-md flex items-center justify-center transition-colors duration-200",
                  "font-medium text-sm leading-4 font-inter",
                  "cursor-pointer",
                  isActive ? "text-zinc-900" : "text-zinc-600"
                )}
                onClick={() => handleTabClick(tab)}
                onMouseDown={() => handleTabMouseDown(tab)}
                onMouseUp={handleTabMouseUp}
                onMouseLeave={handleTabMouseLeave}
                style={{
                  transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div 
                  className={tab !== "All" ? "px-3 flex items-center" : "flex items-center"}
                  style={tab === "All" ? { 
                    paddingLeft: isActive ? '20px' : '12px',
                    paddingRight: isActive ? '20px' : '12px',
                    transition: 'padding 0.2s ease-out'
                  } : {}}
                >
                  {tab}
                  
                  {/* Chevron icon with CSS transition */}
                  {tab !== "All" && (
                    <div
                      className="flex items-center overflow-hidden"
                      style={{
                        opacity: showChevron ? 1 : 0,
                        width: showChevron ? '14px' : '0px',
                        marginLeft: showChevron ? '2px' : '0px',
                        transition: 'opacity 0.2s ease-out, width 0.2s ease-out, margin-left 0.2s ease-out'
                      }}
                    >
                      <ChevronDown size={14} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
} 