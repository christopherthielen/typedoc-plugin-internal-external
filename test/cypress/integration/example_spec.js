describe('docs', () => {
  it('loads', () => {
    cy.visit('');
  });

  it('marks internal_module module as internal', () => {
    cy.visit('/');
    cy.get('nav.tsd-navigation.primary li.tsd-kind-external-module:not(.tsd-is-external)').should(lis => {
      const liText = Array.from(lis).map(li => li.textContent.trim());
      expect(liText).to.include('"internal_module"');
    });
  });

  it('marks external_module module as external', () => {
    cy.visit('/');
    cy.get('nav.tsd-navigation.primary li.tsd-kind-external-module.tsd-is-external').should(lis => {
      const liText = Array.from(lis).map(li => li.textContent.trim());
      expect(liText).to.include('"external_module"');
    });
  });

  it('marks External class as external', () => {
    cy.visit('/');
    cy.get('a')
      .contains('dir1/nest1')
      .click();
    cy.get('.tsd-navigation.secondary a').should(_links => {
      let links = Array.from(_links);
      const texts = links.map(x => x.textContent.trim());
      expect(texts).to.eql(['External', 'Internal']);
    });
    cy.get('label')
      .contains('Externals')
      .click();
    cy.get('.tsd-navigation.secondary a:visible').should(_links => {
      let links = Array.from(_links);
      const texts = links.map(x => x.textContent.trim());
      expect(texts).to.eql(['Internal']);
    });
  });

  it('respects command line options for custom internal tags', () => {
    cy.visit('/');
    cy.get('nav.tsd-navigation.primary li.tsd-kind-external-module:not(.tsd-is-external)').should(lis => {
      const liText = Array.from(lis).map(li => li.textContent.trim());
      expect(liText).to.include('"publicapi"');
    });
  });

  it('respects command line options for custom external tags', () => {
    cy.visit('/');
    cy.get('nav.tsd-navigation.primary li.tsd-kind-external-module.tsd-is-external').should(lis => {
      const liText = Array.from(lis).map(li => li.textContent.trim());
      expect(liText).to.include('"privateapi"');
    });
  });
});
