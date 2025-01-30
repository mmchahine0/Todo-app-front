import React from 'react';
import { DynamicPageContentProps } from './DynamicPages.types';


const DynamicPageContent: React.FC<DynamicPageContentProps> = ({ page }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
      <div>
        {page.content.components?.map((component, index) => {
          switch (component.type) {
            case 'text':
              return <p key={index} className={component.props.className}>{component.props.content}</p>;
            case 'heading':
              return <h2 key={index} className={component.props.className}>{component.props.content}</h2>;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default DynamicPageContent;