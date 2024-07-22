import { Col, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import ProductItem from '../components/ProductItem';
import { useGetProductsQuery } from '../hooks/productHooks';
import { ApiError } from '../types/ApiError';
import { getError } from '../utils';
import { Product } from '../types/Products';

export default function HomePage() {
  const { data, isLoading, error } = useGetProductsQuery();

  // Ensure data is of type Product[]
  const products = data as Product[] | undefined;

  // Function to group products by category
  const groupProductsByCategory = (products: Product[]) => {
    const groupedProducts: { [key: string]: Product[] } = {};
    products.forEach((product) => {
      const { category } = product;
      if (!groupedProducts[category]) {
        groupedProducts[category] = [];
      }
      groupedProducts[category].push(product);
    });
    return groupedProducts;
  };

  return isLoading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">
      {getError(error as unknown as ApiError)}
    </MessageBox>
  ) : (
    <Row>
      <Helmet>
        <title>Chad Thai</title>
      </Helmet>
      {products && Object.entries(groupProductsByCategory(products)).map(
        ([category, products]) => (
          <div key={category}>
            <h1 className="font-weight-bold text-center">{category}</h1>
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3}>
                  <ProductItem product={product} />
                </Col>
              ))}
            </Row>
          </div>
        )
      )}
    </Row>
  );
}
