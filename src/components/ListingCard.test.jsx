import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListingCard from './ListingCard';

const baseListing = {
  category: 'Apartment',
  price: 2500,
  address: '123 Del Playa',
  bedrooms: 2,
  bathrooms: 1,
  square_feet: 900,
  source: 'Zillow',
  url: 'https://example.com'
};

describe('ListingCard Component', () => {

  test('renders all formatted listing data correctly', () => {
    render(<ListingCard listing={baseListing} />);

    expect(screen.getByText('Apartment')).toBeInTheDocument();
    expect(screen.getByText('$2,500/mo')).toBeInTheDocument();
    expect(screen.getByText('123 Del Playa')).toBeInTheDocument();
    expect(screen.getByText('2 bed')).toBeInTheDocument();
    expect(screen.getByText('1 bath')).toBeInTheDocument();
    expect(screen.getByText('900 sq ft')).toBeInTheDocument();
    expect(screen.getByText('Source: Zillow')).toBeInTheDocument();
  });

  test('renders "Price N/A" when price is null', () => {
    const listing = { ...baseListing, price: null };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('Price N/A')).toBeInTheDocument();
  });

  test('renders "Price N/A" when price is undefined', () => {
    const listing = { ...baseListing, price: undefined };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('Price N/A')).toBeInTheDocument();
  });

  test('renders "Studio" when bedrooms is 0', () => {
    const listing = { ...baseListing, bedrooms: 0 };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  test('renders "N/A" when bedrooms is null', () => {
    const listing = { ...baseListing, bedrooms: null };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('renders plain address text when no URL is provided', () => {
    const listing = { ...baseListing, url: null };
    render(<ListingCard listing={listing} />);
    const address = screen.getByText('123 Del Playa');
    expect(address.closest('a')).toBeNull();
  });

  test('renders clickable link when URL is provided', () => {
    render(<ListingCard listing={baseListing} />);
    const link = screen.getByRole('link', { name: '123 Del Playa' });

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('does not render square footage when square_feet is null', () => {
    const listing = { ...baseListing, square_feet: null };
    render(<ListingCard listing={listing} />);
    expect(screen.queryByText(/sq ft/)).toBeNull();
  });

  test('renders square footage with formatting when present', () => {
    const listing = { ...baseListing, square_feet: 1200 };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument();
  });

});