export const postsLocators ={
    cancelBtnLocator:'button:has-text("Cancel")',
    closeBtnLocator:'button:has(svg.lucide-x)',
    titleInputLocator:'input[placeholder="Enter your post title"]',
    ContentInputLocator:'textarea[placeholder="Write your post content here..."]',
    CreatePostBtnLocator:'button[type="submit"]',
    titlePostTxtLocator:'h3.text-2xl.font-semibold.leading-none.tracking-tight',
    contentPostTxtLocator:'p[class="whitespace-pre-wrap"]',
    userNamePostTxtLocator:'div.flex.items-center.gap-2 svg.lucide-user + span',
    favoriteBookPostTxtLocator: 'div.text-sm.mt-1 span:nth-of-type(2)',
    CreatedDatePostTxtLocator: 'div.text-sm.mt-1 >>nth=1'
}