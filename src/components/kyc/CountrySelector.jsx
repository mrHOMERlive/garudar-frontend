import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/components/utils/language';
import { searchCountries } from './countrySearch';

/**
 * Выбор страны с поиском по названию и по ISO-коду.
 *
 * `allowClear` и `allowCustomCode` выключены по умолчанию: компонент давно
 * используют KYC, UBO, Payeer-счета и карточка клиента, и их поведение
 * меняться не должно. Обе опции нужны там, где селектор заменяет свободное
 * текстовое поле — иначе пропадёт возможность стереть значение или вписать
 * код, которого нет в справочнике.
 */
const CountrySelector = ({
  value,
  onChange,
  countries,
  placeholder,
  saveName = false,
  allowClear = false,
  allowCustomCode = false,
  fullWidthPopover = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Компонент вызывают и до загрузки справочника — без этого .find() упал бы
  // на undefined. Мемоизируем, чтобы не ломать зависимости фильтра ниже.
  const options = useMemo(() => (Array.isArray(countries) ? countries : []), [countries]);

  // If saveName is true, 'value' is the country name. Otherwise it's the code.
  // We need to find the country object based on that.
  const selectedCountry = options.find((c) => (saveName ? c.name === value : c.code === value));

  // Поиск вынесен в отдельный модуль: сравнение только с началом строки не
  // находило многословные названия по значимому слову («korea» не давал ни
  // одной Кореи). См. countrySearch.js — там же ранжирование и опечатки.
  const filteredCountries = useMemo(() => searchCountries(options, searchQuery), [options, searchQuery]);

  // Код, которого нет в справочнике: предлагаем использовать как есть, чтобы
  // экзотика не блокировала скрининг. Только когда ввод похож на ISO alpha-2.
  const customCode = searchQuery.trim().toUpperCase();
  const canUseCustomCode =
    allowCustomCode && !saveName && /^[A-Z]{2}$/.test(customCode) && filteredCountries.length === 0;

  const commit = (next) => {
    onChange(next);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between border-slate-200', !value && 'text-muted-foreground')}
        >
          {selectedCountry ? (
            <span>
              {selectedCountry.name} ({selectedCountry.code})
            </span>
          ) : value ? (
            // Значение есть, но в справочнике не найдено — показываем как есть.
            <span>{value}</span>
          ) : (
            <span>{placeholder || t('selectCountry')}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', fullWidthPopover ? 'w-[var(--radix-popover-trigger-width)]' : 'w-[300px]')}
        align="start"
        side="bottom"
        avoidCollisions={false}
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('searchCountry')} value={searchQuery} onValueChange={setSearchQuery} />
          {!canUseCustomCode && <CommandEmpty>{t('noCountryFound')}</CommandEmpty>}
          <CommandGroup className="max-h-64 overflow-auto">
            {canUseCustomCode && (
              <CommandItem value={`__custom_${customCode}`} onSelect={() => commit(customCode)}>
                <Check className="mr-2 h-4 w-4 opacity-0" />
                {t('countryUseCode')} «{customCode}»
              </CommandItem>
            )}
            {allowClear && value && !searchQuery && (
              <CommandItem value="__clear" onSelect={() => commit('')}>
                <X className="mr-2 h-4 w-4 opacity-60" />
                {t('countryClear')}
              </CommandItem>
            )}
            {filteredCountries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => commit(saveName ? country.name : country.code)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    (saveName ? value === country.name : value === country.code) ? 'opacity-100' : 'opacity-0'
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
