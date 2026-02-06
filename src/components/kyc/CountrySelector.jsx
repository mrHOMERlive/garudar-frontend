import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Search, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

const CountrySelector = ({ value, onChange, language, countries, placeholder, saveName = false }) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // If saveName is true, 'value' is the country name. Otherwise it's the code.
    // We need to find the country object based on that.
    const selectedCountry = countries.find(c =>
        saveName ? c.name === value : c.code === value
    );

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return countries;
        const query = searchQuery.toUpperCase();
        return countries.filter(country =>
            country.name.toUpperCase().startsWith(query) ||
            country.code.toUpperCase().startsWith(query)
        );
    }, [countries, searchQuery]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        "w-full justify-between border-slate-200",
                        !value && "text-muted-foreground"
                    )}
                >
                    {selectedCountry ? (
                        <span>{selectedCountry.name} ({selectedCountry.code})</span>
                    ) : (
                        <span>{placeholder || (language === 'en' ? 'Select country...' : 'Pilih negara...')}</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[300px] p-0"
                align="start"
                side="bottom"
                avoidCollisions={false}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={language === 'en' ? "Search country..." : "Cari negara..."}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>{language === 'en' ? 'No country found.' : 'Negara tidak ditemukan.'}</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {filteredCountries.map((country) => (
                            <CommandItem
                                key={country.code}
                                value={country.name}
                                onSelect={() => {
                                    onChange(saveName ? country.name : country.code);
                                    setOpen(false);
                                    setSearchQuery('');
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        (saveName ? value === country.name : value === country.code) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {country.name} ({country.code})
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default CountrySelector;
